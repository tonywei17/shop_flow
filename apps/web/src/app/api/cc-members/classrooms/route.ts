import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    
    const billingMonth = searchParams.get("billing_month");
    const branchCode = searchParams.get("branch_code");
    
    if (!billingMonth || !branchCode) {
      return NextResponse.json(
        { error: "billing_month and branch_code are required" },
        { status: 400 }
      );
    }
    
    // Get all classrooms for this branch (excluding branch summary row)
    const { data: classrooms, error } = await supabase
      .from("cc_members")
      .select("*")
      .eq("billing_month", billingMonth)
      .eq("branch_code", branchCode)
      .eq("is_excluded", false)
      .order("classroom_code", { ascending: true });
    
    if (error) {
      console.error("Error fetching classrooms:", error);
      return NextResponse.json(
        { error: "Failed to fetch classrooms" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      classrooms: classrooms || [],
      count: classrooms?.length || 0,
    });
  } catch (error) {
    console.error("Error in GET /api/cc-members/classrooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
