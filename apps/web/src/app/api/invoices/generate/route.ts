import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import {
  generateInvoicesBatch,
  type InvoiceGenerationResult,
} from "@enterprise/domain-settlement";

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

    // Use domain package to generate invoices
    const results = await generateInvoicesBatch(
      supabase,
      departments,
      billing_month
    );
    
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
