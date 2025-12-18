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
    
    // 支局自己的store_code（branch_code + "000"）
    const branchStoreCode = branchCode + "000";
    
    // 获取非排除的普通教室
    const { data: normalClassrooms, error: normalError } = await supabase
      .from("cc_members")
      .select("*")
      .eq("billing_month", billingMonth)
      .eq("branch_code", branchCode)
      .eq("is_excluded", false)
      .eq("is_bank_transfer", false)
      .order("classroom_code", { ascending: true });
    
    if (normalError) {
      console.error("Error fetching normal classrooms:", normalError);
      return NextResponse.json(
        { error: "Failed to fetch classrooms" },
        { status: 500 }
      );
    }
    
    // 获取口座振替教室（不受is_excluded过滤）
    const { data: bankTransferClassrooms, error: bankTransferError } = await supabase
      .from("cc_members")
      .select("*")
      .eq("billing_month", billingMonth)
      .eq("branch_code", branchCode)
      .eq("is_bank_transfer", true)
      .order("classroom_code", { ascending: true });
    
    if (bankTransferError) {
      console.error("Error fetching bank transfer classrooms:", bankTransferError);
      return NextResponse.json(
        { error: "Failed to fetch classrooms" },
        { status: 500 }
      );
    }
    
    // 获取支局自己的数据（即使is_excluded为true也要显示）
    const { data: branchOwnData, error: branchOwnError } = await supabase
      .from("cc_members")
      .select("*")
      .eq("billing_month", billingMonth)
      .eq("classroom_code", branchStoreCode)
      .eq("is_bank_transfer", false);
    
    if (branchOwnError) {
      console.error("Error fetching branch own data:", branchOwnError);
      return NextResponse.json(
        { error: "Failed to fetch classrooms" },
        { status: 500 }
      );
    }
    
    // 合并数据，去重
    const classroomsMap = new Map<string, typeof normalClassrooms extends (infer T)[] | null ? T : never>();
    (normalClassrooms || []).forEach(c => classroomsMap.set(c.classroom_code, c));
    (bankTransferClassrooms || []).forEach(c => {
      if (!classroomsMap.has(c.classroom_code)) {
        classroomsMap.set(c.classroom_code, c);
      }
    });
    (branchOwnData || []).forEach(c => {
      if (!classroomsMap.has(c.classroom_code)) {
        classroomsMap.set(c.classroom_code, c);
      }
    });
    
    // 按classroom_code排序
    const classrooms = Array.from(classroomsMap.values()).sort((a, b) => 
      (a.classroom_code || "").localeCompare(b.classroom_code || "")
    );
    
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
