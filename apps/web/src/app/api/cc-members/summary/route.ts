import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    
    const billingMonth = searchParams.get("billing_month");
    
    if (!billingMonth) {
      return NextResponse.json(
        { error: "billing_month is required" },
        { status: 400 }
      );
    }
    
    // Get all members for the month (excluding bank transfer and branch rows)
    const { data: members, error } = await supabase
      .from("cc_members")
      .select("*")
      .eq("billing_month", billingMonth)
      .eq("is_excluded", false);
    
    if (error) {
      console.error("Error fetching cc_members:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get branch names from branch summary rows (classroom_code ends with 000)
    const { data: branchRows } = await supabase
      .from("cc_members")
      .select("classroom_code, classroom_name, branch_code")
      .eq("billing_month", billingMonth)
      .like("classroom_code", "%000");
    
    // Create branch name lookup
    const branchNameMap: Record<string, string> = {};
    for (const row of branchRows || []) {
      if (row.branch_code && row.classroom_name) {
        branchNameMap[row.branch_code] = row.classroom_name;
      }
    }
    
    // Calculate summary by branch
    const branchSummary: Record<string, {
      branch_code: string;
      branch_name: string;
      classroom_count: number;
      total_members: number;
      aigran_members: number;
      regular_members: number;
      bank_transfer_classrooms: number;
      total_amount: number;
    }> = {};
    
    let totalMembers = 0;
    let totalAmount = 0;
    let totalClassrooms = 0;
    let aigranTotal = 0;
    
    for (const member of members || []) {
      const branchCode = member.branch_code || "unknown";
      
      if (!branchSummary[branchCode]) {
        branchSummary[branchCode] = {
          branch_code: branchCode,
          branch_name: branchNameMap[branchCode] || member.branch_name || "",
          classroom_count: 0,
          total_members: 0,
          aigran_members: 0,
          regular_members: 0,
          bank_transfer_classrooms: 0,
          total_amount: 0,
        };
      }
      
      branchSummary[branchCode].classroom_count++;
      branchSummary[branchCode].total_members += member.total_count || 0;
      branchSummary[branchCode].total_amount += member.amount || 0;
      
      if (member.is_aigran) {
        branchSummary[branchCode].aigran_members += member.total_count || 0;
        aigranTotal += member.total_count || 0;
      } else {
        branchSummary[branchCode].regular_members += member.total_count || 0;
      }
      
      totalMembers += member.total_count || 0;
      totalAmount += member.amount || 0;
      totalClassrooms++;
    }
    
    // Get bank transfer (収納代行済み) classrooms with their member counts and amounts
    const { data: bankTransferData } = await supabase
      .from("cc_members")
      .select("branch_code, total_count, amount")
      .eq("billing_month", billingMonth)
      .eq("is_bank_transfer", true);
    
    const bankTransferCount = bankTransferData?.length || 0;
    const bankTransferMembers = bankTransferData?.reduce((sum, item) => sum + (item.total_count || 0), 0) || 0;
    const bankTransferAmount = bankTransferData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    
    // Get unique branch count
    const branchCount = Object.keys(branchSummary).length;
    
    return NextResponse.json({
      billing_month: billingMonth,
      summary: {
        total_members: totalMembers,
        total_amount: totalAmount,
        total_classrooms: totalClassrooms,
        branch_count: branchCount,
        aigran_members: aigranTotal,
        bank_transfer_classrooms: bankTransferCount,
        bank_transfer_members: bankTransferMembers,
        bank_transfer_amount: bankTransferAmount,
      },
      branches: Object.values(branchSummary).sort((a, b) => 
        a.branch_code.localeCompare(b.branch_code)
      ),
    });
  } catch (error) {
    console.error("Error in GET /api/cc-members/summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
