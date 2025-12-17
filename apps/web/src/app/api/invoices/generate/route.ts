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
    
    const { billing_month, department_ids } = body;
    
    if (!billing_month) {
      return NextResponse.json(
        { error: "billing_month is required" },
        { status: 400 }
      );
    }
    
    // Get departments (branches) to generate invoices for
    let departmentsQuery = supabase
      .from("departments")
      .select("*")
      .eq("type", "支局")
      .in("status", ["有効", "active"]);
    
    if (department_ids && department_ids.length > 0) {
      departmentsQuery = departmentsQuery.in("id", department_ids);
    }
    
    const { data: departments, error: deptError } = await departmentsQuery;
    
    if (deptError) {
      console.error("Error fetching departments:", deptError);
      return NextResponse.json({ error: deptError.message }, { status: 500 });
    }
    
    if (!departments || departments.length === 0) {
      return NextResponse.json(
        { error: "No departments found" },
        { status: 404 }
      );
    }
    
    const results: InvoiceGenerationResult[] = [];
    
    for (const dept of departments) {
      try {
        const result = await generateInvoiceForDepartment(
          supabase,
          dept,
          billing_month
        );
        results.push(result);
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
    
    const successCount = results.filter((r) => r.status === "created").length;
    const errorCount = results.filter((r) => r.status === "error").length;
    
    return NextResponse.json({
      success: true,
      billing_month,
      total: results.length,
      success_count: successCount,
      error_count: errorCount,
      results,
    });
  } catch (error) {
    console.error("Error in POST /api/invoices/generate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateInvoiceForDepartment(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  department: { id: string; name: string; store_code: string | null },
  billingMonth: string
): Promise<InvoiceGenerationResult> {
  // 1. Calculate previous balance (unpaid invoices from previous months)
  const previousBalance = await calculatePreviousBalance(
    supabase,
    department.id,
    billingMonth
  );
  
  // 2. Get material orders (payment_method = 'invoice')
  const materialAmount = await calculateMaterialAmount(
    supabase,
    department.id,
    billingMonth
  );
  
  // 3. Get CC membership fees
  const membershipAmount = await calculateMembershipAmount(
    supabase,
    department.store_code,
    billingMonth
  );
  
  // 4. Get other expenses
  const otherExpensesAmount = await calculateOtherExpenses(
    supabase,
    department.store_code,
    billingMonth
  );
  
  // Calculate totals
  const subtotal = previousBalance + materialAmount + membershipAmount + otherExpensesAmount;
  const taxAmount = Math.floor((materialAmount + membershipAmount + otherExpensesAmount) * 0.1);
  const totalAmount = subtotal + taxAmount;
  
  // Generate invoice number
  const { data: countData } = await supabase
    .from("invoices")
    .select("id", { count: "exact" })
    .eq("billing_month", billingMonth);
  
  const count = (countData?.length || 0) + 1;
  const invoiceNumber = `INV-${billingMonth.replace("-", "")}-${String(count).padStart(3, "0")}`;
  
  // Calculate due date (end of next month)
  const [year, month] = billingMonth.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const dueDate = new Date(nextYear, nextMonth, 0).toISOString().split("T")[0];
  
  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      department_id: department.id,
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
    })
    .select()
    .single();
  
  if (invoiceError || !invoice) {
    throw new Error(invoiceError?.message || "Failed to create invoice");
  }
  
  // Create invoice items
  await createInvoiceItems(
    supabase,
    invoice.id,
    department,
    billingMonth,
    previousBalance,
    materialAmount,
    membershipAmount,
    otherExpensesAmount
  );
  
  return {
    department_id: department.id,
    department_name: department.name,
    invoice_id: invoice.id,
    invoice_number: invoiceNumber,
    total_amount: totalAmount,
    status: "created",
  };
}

async function calculatePreviousBalance(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  departmentId: string,
  billingMonth: string
): Promise<number> {
  // Get unpaid invoices from previous months
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
  // Get orders with payment_method = 'invoice' for the billing month
  // Note: This requires linking orders to departments, which may need adjustment
  // For now, return 0 as placeholder
  return 0;
}

async function calculateMembershipAmount(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  storeCode: string | null,
  billingMonth: string
): Promise<number> {
  if (!storeCode) return 0;
  
  // Get CC members for this branch (not excluded)
  const { data: members } = await supabase
    .from("cc_members")
    .select("amount")
    .eq("billing_month", billingMonth)
    .eq("branch_code", storeCode)
    .eq("is_excluded", false);
  
  if (!members) return 0;
  
  return members.reduce((sum, m) => sum + (m.amount || 0), 0);
}

async function calculateOtherExpenses(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  storeCode: string | null,
  billingMonth: string
): Promise<number> {
  if (!storeCode) return 0;
  
  // Get approved expenses for this store
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
  
  // Previous balance item
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
  
  // Material amount item
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
  
  // Membership amount item
  if (membershipAmount > 0) {
    // Get member count for description
    const { data: members } = await supabase
      .from("cc_members")
      .select("total_count")
      .eq("billing_month", billingMonth)
      .eq("branch_code", department.store_code)
      .eq("is_excluded", false);
    
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
  
  // Other expenses item
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
