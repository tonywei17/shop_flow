import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    
    const billingMonth = searchParams.get("billing_month");
    const branchCode = searchParams.get("branch_code");
    const includeExcluded = searchParams.get("include_excluded") === "true";
    
    let query = supabase
      .from("cc_members")
      .select("*")
      .order("branch_code", { ascending: true })
      .order("classroom_code", { ascending: true });
    
    if (billingMonth) {
      query = query.eq("billing_month", billingMonth);
    }
    
    if (branchCode) {
      query = query.eq("branch_code", branchCode);
    }
    
    if (!includeExcluded) {
      query = query.eq("is_excluded", false);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching cc_members:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in GET /api/cc-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
