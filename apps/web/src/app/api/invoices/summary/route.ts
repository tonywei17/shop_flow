import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    
    const billingMonth = searchParams.get("billing_month");
    const invoiceType = searchParams.get("type") || "branch";
    
    if (!billingMonth) {
      return NextResponse.json(
        { error: "billing_month is required" },
        { status: 400 }
      );
    }

    // 1. Get previous balance (unpaid invoices from previous months)
    const previousBalance = await getPreviousBalance(supabase, billingMonth);

    // 2. Get material orders
    const materialOrders = await getMaterialOrders(supabase, billingMonth);

    // 3. Get CC members data
    const ccMembers = await getCcMembersData(supabase, billingMonth, invoiceType);

    // 4. Get other expenses
    const otherExpenses = await getOtherExpenses(supabase, billingMonth);

    // 5. Calculate invoice count
    const invoiceCount = await getInvoiceCount(supabase, billingMonth, invoiceType);

    return NextResponse.json({
      previousBalance,
      materialOrders,
      ccMembers,
      otherExpenses,
      invoiceCount,
    });
  } catch (error) {
    console.error("Error in GET /api/invoices/summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getPreviousBalance(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string
) {
  // Get unpaid invoices from previous months
  const { data: unpaidInvoices } = await supabase
    .from("invoices")
    .select("id, total_amount, paid_amount")
    .lt("billing_month", billingMonth)
    .in("status", ["sent", "overdue", "partial_paid"]);

  const count = unpaidInvoices?.length || 0;
  const amount = unpaidInvoices?.reduce((sum, inv) => {
    return sum + ((inv.total_amount || 0) - (inv.paid_amount || 0));
  }, 0) || 0;

  return { count, amount };
}

async function getMaterialOrders(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string
) {
  // Parse billing month to get date range
  const [year, month] = billingMonth.split("-").map(Number);
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  // Get orders for the billing month
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, payment_method, payment_status")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (!orders) {
    return {
      count: 0,
      stripeAmount: 0,
      invoiceAmount: 0,
      totalAmount: 0,
    };
  }

  const stripeOrders = orders.filter((o) => o.payment_method === "stripe" && o.payment_status === "paid");
  const invoiceOrders = orders.filter((o) => o.payment_method === "invoice");

  return {
    count: orders.length,
    stripeAmount: stripeOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    invoiceAmount: invoiceOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    totalAmount: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };
}

async function getCcMembersData(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string,
  invoiceType: string
) {
  // For branch invoices: exclude bank transfer classrooms
  // For agency invoices: only include bank transfer classrooms
  const isBankTransfer = invoiceType === "agency";

  const { data: members } = await supabase
    .from("cc_members")
    .select("branch_code, classroom_code, total_count, amount")
    .eq("billing_month", billingMonth)
    .eq("is_bank_transfer", isBankTransfer)
    .eq("is_excluded", isBankTransfer ? false : false); // For agency, we want bank_transfer but not excluded

  if (!members) {
    return {
      branchCount: 0,
      classroomCount: 0,
      memberCount: 0,
      amount: 0,
    };
  }

  // Get unique branch codes
  const branchCodes = new Set(members.map((m) => m.branch_code));

  return {
    branchCount: branchCodes.size,
    classroomCount: members.length,
    memberCount: members.reduce((sum, m) => sum + (m.total_count || 0), 0),
    amount: members.reduce((sum, m) => sum + (m.amount || 0), 0),
  };
}

async function getOtherExpenses(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string
) {
  // Get approved expenses that haven't been invoiced yet
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount")
    .eq("invoice_month", billingMonth)
    .eq("review_status", "approved")
    .is("invoice_id", null);

  return {
    count: expenses?.length || 0,
    amount: expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0,
  };
}

async function getInvoiceCount(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string,
  invoiceType: string
) {
  if (invoiceType === "branch") {
    // Count unique branches that have CC members data for this month
    // Use cc_members table directly since branch_code format differs from departments.store_code
    const { data: members } = await supabase
      .from("cc_members")
      .select("branch_code")
      .eq("billing_month", billingMonth)
      .eq("is_excluded", false)
      .eq("is_bank_transfer", false);

    if (!members) return 0;

    // Count unique branch codes
    const uniqueBranches = new Set(members.map((m) => m.branch_code).filter(Boolean));
    return uniqueBranches.size;
  } else {
    // For agency invoices, count unique branches with bank transfer classrooms
    const { data: members } = await supabase
      .from("cc_members")
      .select("branch_code")
      .eq("billing_month", billingMonth)
      .eq("is_bank_transfer", true);

    if (!members) return 0;

    const branchCodes = new Set(members.map((m) => m.branch_code));
    return branchCodes.size;
  }
}
