import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    
    const billingMonth = searchParams.get("billing_month");
    const status = searchParams.get("status");
    const departmentId = searchParams.get("department_id");
    
    const showAllVersions = searchParams.get("show_all_versions") === "true";
    
    let query = supabase
      .from("invoices")
      .select(`
        *,
        departments:department_id (
          id,
          name,
          store_code,
          type
        )
      `)
      .order("created_at", { ascending: false });
    
    // By default, only show current versions (not superseded)
    if (!showAllVersions) {
      query = query.eq("is_current", true);
    }
    
    if (billingMonth) {
      query = query.eq("billing_month", billingMonth);
    }
    
    if (status) {
      query = query.eq("status", status);
    }
    
    if (departmentId) {
      query = query.eq("department_id", departmentId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in GET /api/invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { department_id, billing_month, ...rest } = body;
    
    if (!department_id || !billing_month) {
      return NextResponse.json(
        { error: "department_id and billing_month are required" },
        { status: 400 }
      );
    }
    
    // Generate invoice number
    const { data: countData } = await supabase
      .from("invoices")
      .select("id", { count: "exact" })
      .eq("billing_month", billing_month);
    
    const count = (countData?.length || 0) + 1;
    const invoiceNumber = `INV-${billing_month.replace("-", "")}-${String(count).padStart(3, "0")}`;
    
    // Calculate due date (end of next month)
    const [year, month] = billing_month.split("-").map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const dueDate = new Date(nextYear, nextMonth, 0).toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        department_id,
        billing_month,
        due_date: dueDate,
        status: "draft",
        ...rest,
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in POST /api/invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
