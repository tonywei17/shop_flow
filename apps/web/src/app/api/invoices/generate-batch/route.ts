import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

interface InvoiceGenerationResult {
  department_id: string;
  department_name: string;
  invoice_id: string;
  invoice_number: string;
  total_amount: number;
  status: "created" | "error";
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { 
      billing_month, 
      invoice_type = "branch",
      auto_send = false,
      scheduled_at = null,
    } = body;
    
    if (!billing_month) {
      return NextResponse.json(
        { error: "billing_month is required" },
        { status: 400 }
      );
    }

    // Non-streaming mode
    const results: InvoiceGenerationResult[] = [];
    const errors: string[] = [];

    if (invoice_type === "branch") {
      // Generate branch invoices
      const branchResults = await generateBranchInvoices(
        supabase,
        billing_month,
        auto_send,
        scheduled_at
      );
      results.push(...branchResults.results);
      errors.push(...branchResults.errors);
    } else {
      // Generate agency invoices
      const agencyResults = await generateAgencyInvoices(
        supabase,
        billing_month,
        auto_send,
        scheduled_at
      );
      results.push(...agencyResults.results);
      errors.push(...agencyResults.errors);
    }

    const successCount = results.filter((r) => r.status === "created").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      success: true,
      billing_month,
      invoice_type,
      total: results.length,
      success_count: successCount,
      error_count: errorCount,
      errors,
      results,
    });
  } catch (error) {
    console.error("Error in POST /api/invoices/generate-batch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateBranchInvoices(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string,
  autoSend: boolean,
  scheduledAt: string | null
): Promise<{ results: InvoiceGenerationResult[]; errors: string[] }> {
  const results: InvoiceGenerationResult[] = [];
  const errors: string[] = [];

  // Get all active branches
  const { data: departments, error: deptError } = await supabase
    .from("departments")
    .select("*")
    .eq("type", "支局")
    .in("status", ["有効", "active"]);

  if (deptError || !departments) {
    errors.push("部署データの取得に失敗しました");
    return { results, errors };
  }

  for (const dept of departments) {
    try {
      // Check if current invoice already exists for this department and month
      const { data: existingInvoice } = await supabase
        .from("invoices")
        .select("id, version, status, is_current")
        .eq("department_id", dept.id)
        .eq("billing_month", billingMonth)
        .eq("is_current", true)
        .single();

      let newVersion = 1;
      let generationReason = "initial";

      // If current invoice exists, create a new version
      if (existingInvoice) {
        // Only allow new version if existing is in draft status
        if (existingInvoice.status !== "draft") {
          results.push({
            department_id: dept.id,
            department_name: dept.name,
            invoice_id: existingInvoice.id,
            invoice_number: "",
            total_amount: 0,
            status: "error",
            error: `請求書は既に${existingInvoice.status === "confirmed" ? "確認済み" : existingInvoice.status === "sent" ? "送付済み" : "処理済み"}です`,
          });
          continue;
        }
        
        newVersion = (existingInvoice.version || 1) + 1;
        generationReason = "recalculation";
        
        // Mark old invoice as superseded
        await supabase
          .from("invoices")
          .update({ 
            is_current: false, 
            status: "superseded" 
          })
          .eq("id", existingInvoice.id);
      }

      // Calculate amounts
      const previousBalance = await calculatePreviousBalance(supabase, dept.id, billingMonth);
      const materialAmount = await calculateMaterialAmount(supabase, dept.id, billingMonth);
      const membershipAmount = await calculateMembershipAmount(supabase, dept.store_code, billingMonth);
      const otherExpensesAmount = await calculateOtherExpenses(supabase, dept.store_code, billingMonth);

      // Generate invoice even if all amounts are 0

      // Calculate totals
      const subtotal = previousBalance + materialAmount + membershipAmount + otherExpensesAmount;
      const taxAmount = Math.floor((materialAmount + membershipAmount + otherExpensesAmount) * 0.1);
      const totalAmount = subtotal + taxAmount;

      // Generate invoice number with version
      // Format: INV-YYYYMM-StoreCode-vN (e.g., INV-202512-1110-v1)
      const storeCodeShort = dept.store_code?.substring(0, 4) || "0000";
      const invoiceNumber = `INV-${billingMonth.replace("-", "")}-${storeCodeShort}-v${newVersion}`;

      // Calculate due date (end of next month)
      const [year, month] = billingMonth.split("-").map(Number);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const dueDate = new Date(nextYear, nextMonth, 0).toISOString().split("T")[0];

      // Create invoice with versioning
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          department_id: dept.id,
          billing_month: billingMonth,
          previous_balance: previousBalance,
          material_amount: materialAmount,
          membership_amount: membershipAmount,
          other_expenses_amount: otherExpensesAmount,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: "draft",
          due_date: dueDate,
          version: newVersion,
          is_current: true,
          generation_reason: generationReason,
          supersedes: existingInvoice?.id || null,
        })
        .select()
        .single();

      if (invoiceError || !invoice) {
        results.push({
          department_id: dept.id,
          department_name: dept.name,
          invoice_id: "",
          invoice_number: "",
          total_amount: 0,
          status: "error",
          error: invoiceError?.message || "請求書の作成に失敗しました",
        });
        continue;
      }

      // Update old invoice's superseded_by field
      if (existingInvoice) {
        await supabase
          .from("invoices")
          .update({ superseded_by: invoice.id })
          .eq("id", existingInvoice.id);
      }

      // Create invoice items
      await createInvoiceItems(
        supabase,
        invoice.id,
        dept,
        billingMonth,
        previousBalance,
        materialAmount,
        membershipAmount,
        otherExpensesAmount
      );

      // Handle auto-send
      if (autoSend) {
        await supabase
          .from("invoices")
          .update({
            status: scheduledAt ? "confirmed" : "sent",
            sent_at: scheduledAt ? null : new Date().toISOString(),
            sent_method: "email",
          })
          .eq("id", invoice.id);

        // TODO: Schedule email sending if scheduledAt is provided
      }

      results.push({
        department_id: dept.id,
        department_name: dept.name,
        invoice_id: invoice.id,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        status: "created",
      });
    } catch (error) {
      results.push({
        department_id: dept.id,
        department_name: dept.name,
        invoice_id: "",
        invoice_number: "",
        total_amount: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { results, errors };
}

async function generateAgencyInvoices(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string,
  autoSend: boolean,
  scheduledAt: string | null
): Promise<{ results: InvoiceGenerationResult[]; errors: string[] }> {
  const results: InvoiceGenerationResult[] = [];
  const errors: string[] = [];

  // Get all bank transfer classrooms grouped by branch
  const { data: members } = await supabase
    .from("cc_members")
    .select("branch_code, branch_name, total_count, amount")
    .eq("billing_month", billingMonth)
    .eq("is_bank_transfer", true);

  if (!members || members.length === 0) {
    return { results, errors };
  }

  // Group by branch
  const branchData = new Map<string, { name: string; memberCount: number; amount: number }>();
  for (const member of members) {
    if (!member.branch_code) continue;
    
    const existing = branchData.get(member.branch_code) || { 
      name: member.branch_name || "", 
      memberCount: 0, 
      amount: 0 
    };
    
    branchData.set(member.branch_code, {
      name: existing.name || member.branch_name || "",
      memberCount: existing.memberCount + (member.total_count || 0),
      amount: existing.amount + (member.amount || 0),
    });
  }

  // Generate invoice for each branch with bank transfer data
  for (const [branchCode, data] of branchData) {
    try {
      // Generate invoice number for agency
      const { data: countData } = await supabase
        .from("invoices")
        .select("id", { count: "exact" })
        .eq("billing_month", billingMonth);

      const count = (countData?.length || 0) + 1;
      const invoiceNumber = `AGY-${billingMonth.replace("-", "")}-${String(count).padStart(3, "0")}`;

      // Calculate totals
      const subtotal = data.amount;
      const taxAmount = Math.floor(subtotal * 0.1);
      const totalAmount = subtotal + taxAmount;

      // Calculate due date
      const [year, month] = billingMonth.split("-").map(Number);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const dueDate = new Date(nextYear, nextMonth, 0).toISOString().split("T")[0];

      // Find or create a placeholder department for agency invoices
      let { data: agencyDept } = await supabase
        .from("departments")
        .select("id")
        .eq("store_code", branchCode)
        .single();

      if (!agencyDept) {
        // Create a placeholder entry or skip
        results.push({
          department_id: "",
          department_name: data.name || branchCode,
          invoice_id: "",
          invoice_number: invoiceNumber,
          total_amount: totalAmount,
          status: "error",
          error: `支局 ${branchCode} が見つかりません`,
        });
        continue;
      }

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          department_id: agencyDept.id,
          billing_month: billingMonth,
          previous_balance: 0,
          material_amount: 0,
          membership_amount: data.amount,
          other_expenses_amount: 0,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: "draft",
          due_date: dueDate,
          notes: "収納代行請求書",
        })
        .select()
        .single();

      if (invoiceError || !invoice) {
        results.push({
          department_id: agencyDept.id,
          department_name: data.name || branchCode,
          invoice_id: "",
          invoice_number: "",
          total_amount: 0,
          status: "error",
          error: invoiceError?.message || "請求書の作成に失敗しました",
        });
        continue;
      }

      // Create invoice item
      await supabase.from("invoice_items").insert({
        invoice_id: invoice.id,
        item_type: "membership",
        description: `収納代行 CC会員費 (${data.memberCount}名)`,
        quantity: data.memberCount,
        unit_price: 600,
        amount: data.amount,
        tax_rate: 10,
        tax_amount: taxAmount,
        sort_order: 0,
      });

      results.push({
        department_id: agencyDept.id,
        department_name: data.name || branchCode,
        invoice_id: invoice.id,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        status: "created",
      });
    } catch (error) {
      errors.push(`支局 ${branchCode}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return { results, errors };
}

// Helper functions (same as in generate/route.ts)
async function calculatePreviousBalance(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  departmentId: string,
  billingMonth: string
): Promise<number> {
  const { data: unpaidInvoices } = await supabase
    .from("invoices")
    .select("total_amount, paid_amount")
    .eq("department_id", departmentId)
    .lt("billing_month", billingMonth)
    .in("status", ["sent", "overdue", "partial_paid"]);

  if (!unpaidInvoices) return 0;

  return unpaidInvoices.reduce((sum, inv) => {
    return sum + ((inv.total_amount || 0) - (inv.paid_amount || 0));
  }, 0);
}

async function calculateMaterialAmount(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  departmentId: string,
  billingMonth: string
): Promise<number> {
  // TODO: Implement when orders are linked to departments
  return 0;
}

async function calculateMembershipAmount(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  storeCode: string | null,
  billingMonth: string
): Promise<number> {
  if (!storeCode) return 0;

  // Extract first 4 digits as branch_code (cc_members uses 4-digit codes)
  const branchCode = storeCode.substring(0, 4);

  const { data: members } = await supabase
    .from("cc_members")
    .select("amount")
    .eq("billing_month", billingMonth)
    .eq("branch_code", branchCode)
    .eq("is_excluded", false)
    .eq("is_bank_transfer", false);

  if (!members) return 0;

  return members.reduce((sum, m) => sum + (m.amount || 0), 0);
}

async function calculateOtherExpenses(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  storeCode: string | null,
  billingMonth: string
): Promise<number> {
  if (!storeCode) return 0;

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("store_code", storeCode)
    .eq("invoice_month", billingMonth)
    .eq("review_status", "approved")
    .is("invoice_id", null);

  if (!expenses) return 0;

  return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

async function createInvoiceItems(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  invoiceId: string,
  department: { id: string; store_code: string | null },
  billingMonth: string,
  previousBalance: number,
  materialAmount: number,
  membershipAmount: number,
  otherExpensesAmount: number
): Promise<void> {
  const items = [];
  let sortOrder = 0;

  if (previousBalance > 0) {
    items.push({
      invoice_id: invoiceId,
      item_type: "previous_balance",
      description: "前月未払残高",
      amount: previousBalance,
      tax_rate: 0,
      tax_amount: 0,
      sort_order: sortOrder++,
    });
  }

  if (materialAmount > 0) {
    items.push({
      invoice_id: invoiceId,
      item_type: "material",
      description: "教材費",
      amount: materialAmount,
      tax_rate: 10,
      tax_amount: Math.floor(materialAmount * 0.1),
      sort_order: sortOrder++,
    });
  }

  if (membershipAmount > 0) {
    // Extract first 4 digits as branch_code (cc_members uses 4-digit codes)
    const branchCode = department.store_code?.substring(0, 4);
    const { data: members } = await supabase
      .from("cc_members")
      .select("total_count")
      .eq("billing_month", billingMonth)
      .eq("branch_code", branchCode)
      .eq("is_excluded", false)
      .eq("is_bank_transfer", false);

    const totalMembers = members?.reduce((sum, m) => sum + (m.total_count || 0), 0) || 0;

    items.push({
      invoice_id: invoiceId,
      item_type: "membership",
      description: `CC会員費 (${totalMembers}名)`,
      quantity: totalMembers,
      unit_price: 480,
      amount: membershipAmount,
      tax_rate: 10,
      tax_amount: Math.floor(membershipAmount * 0.1),
      sort_order: sortOrder++,
    });
  }

  if (otherExpensesAmount > 0) {
    items.push({
      invoice_id: invoiceId,
      item_type: "other_expense",
      description: "その他費用",
      amount: otherExpensesAmount,
      tax_rate: 10,
      tax_amount: Math.floor(otherExpensesAmount * 0.1),
      sort_order: sortOrder++,
    });

    // Update expenses to link to this invoice
    await supabase
      .from("expenses")
      .update({ invoice_id: invoiceId })
      .eq("store_code", department.store_code)
      .eq("invoice_month", billingMonth)
      .eq("review_status", "approved")
      .is("invoice_id", null);
  }

  if (items.length > 0) {
    await supabase.from("invoice_items").insert(items);
  }
}
