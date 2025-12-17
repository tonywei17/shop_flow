import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const month = searchParams.get("month");

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("expenses")
      .select(`
        id,
        store_code,
        store_name,
        expense_date,
        account_item_code,
        description,
        expense_type,
        amount,
        review_status,
        reviewer_account_id,
        reviewed_at,
        review_note,
        import_source,
        invoice_month,
        created_at
      `)
      .order("created_at", { ascending: false });

    // Filter by specific IDs if provided
    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      if (ids.length > 0) {
        query = query.in("id", ids);
      }
    }

    // Filter by month if provided
    if (month) {
      query = query.eq("invoice_month", month);
    }

    const { data: expenses, error } = await query;

    if (error) {
      console.error("Failed to fetch expenses for export:", error);
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
    }

    // Build CSV content
    const headers = [
      "店番",
      "店名",
      "費用発生日",
      "勘定項目",
      "項目名",
      "費用タイプ",
      "請求金額",
      "審査ステータス",
      "審査日時",
      "審査メモ",
      "インポート元",
      "請求月",
      "作成日時",
    ];

    const statusMap: Record<string, string> = {
      pending: "審査待ち",
      approved: "承認済み",
      rejected: "差し戻し",
    };

    const rows = (expenses || []).map((expense) => [
      expense.store_code || "",
      expense.store_name || "",
      expense.expense_date || "",
      expense.account_item_code || "",
      expense.description || "",
      expense.expense_type || "",
      String(expense.amount || 0),
      statusMap[expense.review_status] || expense.review_status || "",
      expense.reviewed_at ? new Date(expense.reviewed_at).toLocaleString("ja-JP") : "",
      expense.review_note || "",
      expense.import_source || "",
      expense.invoice_month || "",
      expense.created_at ? new Date(expense.created_at).toLocaleString("ja-JP") : "",
    ]);

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Add BOM for Excel compatibility
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `expenses_${timestamp}.csv`;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting expenses:", error);
    return NextResponse.json(
      { error: "エクスポート中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
