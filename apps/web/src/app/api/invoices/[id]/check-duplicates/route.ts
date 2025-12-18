import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

interface DuplicateItem {
  id: string;
  source: "auto" | "csv";
  description: string;
  amount: number;
  classroom_code?: string;
  recommended_delete: boolean;
}

interface DuplicateGroup {
  classroom_code: string;
  classroom_name: string;
  member_count: number;
  items: DuplicateItem[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // 获取请求书数据
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        departments(id, name, store_code)
      `)
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "請求書が見つかりません" },
        { status: 404 }
      );
    }

    const deptData = Array.isArray(invoice.departments)
      ? invoice.departments[0]
      : invoice.departments;

    const storeCode = deptData?.store_code;
    const branchCode = storeCode?.substring(0, 4);
    const billingMonth = invoice.billing_month;
    const billingMonthNum = billingMonth.split("-")[1].replace(/^0/, "");

    // 获取口座振替教室数据（自动生成的）
    const { data: bankTransferMembers } = await supabase
      .from("cc_members")
      .select("classroom_name, classroom_code, total_count")
      .eq("billing_month", billingMonth)
      .eq("branch_code", branchCode)
      .eq("is_bank_transfer", true)
      .gt("total_count", 0);

    // 获取expenses表中的口座振替相关数据（CSV导入的）
    const { data: expenses } = await supabase
      .from("expenses")
      .select("id, description, amount")
      .eq("store_code", storeCode)
      .eq("invoice_month", billingMonth)
      .eq("review_status", "approved")
      .ilike("description", `%月度チャイルドクラブ会費(口座振替分)%`);

    const duplicates: DuplicateGroup[] = [];

    // 检查每个口座振替教室是否有重复（自动生成 + CSV导入）
    for (const member of bankTransferMembers || []) {
      const storeCodeSuffix = member.classroom_code.slice(-3);
      const autoDescription = `${billingMonthNum}月度チャイルドクラブ会費(口座振替分)(${storeCodeSuffix})${member.total_count}名分@600`;
      const autoAmount = -(member.total_count * 600);

      // 查找匹配的CSV导入数据
      const matchingExpenses = (expenses || []).filter((e) => {
        return e.description.includes(`(${storeCodeSuffix})`);
      });

      // 如果有CSV导入的数据，说明存在重复
      if (matchingExpenses.length > 0) {
        const items: DuplicateItem[] = [
          {
            id: `auto_${member.classroom_code}`,
            source: "auto",
            description: autoDescription,
            amount: autoAmount,
            classroom_code: member.classroom_code,
            recommended_delete: false, // 保留自动生成的
          },
          ...matchingExpenses.map((e) => ({
            id: e.id,
            source: "csv" as const,
            description: e.description,
            amount: e.amount,
            classroom_code: member.classroom_code,
            recommended_delete: true, // 推荐删除CSV导入的
          })),
        ];

        duplicates.push({
          classroom_code: member.classroom_code,
          classroom_name: member.classroom_name,
          member_count: member.total_count,
          items,
        });
      }
    }

    return NextResponse.json({
      invoice_id: id,
      billing_month: billingMonth,
      department_name: deptData?.name,
      has_duplicates: duplicates.length > 0,
      duplicate_count: duplicates.length,
      duplicates,
    });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return NextResponse.json(
      { error: "重複チェック中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 删除选中的重复项
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const { expense_ids } = body as { expense_ids: string[] };

    if (!expense_ids || expense_ids.length === 0) {
      return NextResponse.json(
        { error: "削除する項目が指定されていません" },
        { status: 400 }
      );
    }

    // 只删除expenses表中的数据（CSV导入的），不删除自动生成的
    const realExpenseIds = expense_ids.filter((id) => !id.startsWith("auto_"));

    if (realExpenseIds.length === 0) {
      return NextResponse.json({
        success: true,
        deleted_count: 0,
        message: "自動生成データは削除できません",
      });
    }

    const { error: deleteError } = await supabase
      .from("expenses")
      .delete()
      .in("id", realExpenseIds);

    if (deleteError) {
      return NextResponse.json(
        { error: "削除に失敗しました", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_count: realExpenseIds.length,
      message: `${realExpenseIds.length}件の重複データを削除しました`,
    });
  } catch (error) {
    console.error("Error deleting duplicates:", error);
    return NextResponse.json(
      { error: "削除中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
