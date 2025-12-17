import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

type CreateExpenseRequest = {
  store_code: string;
  store_name: string;
  expense_date: string;
  account_item_code: string;
  description: string;
  expense_type: string;
  amount: number;
  import_source?: string;
  import_batch_id?: string;
  invoice_month?: string;
  reviewer_account_id?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: CreateExpenseRequest = await request.json();

    // Validation
    if (!body.store_code?.trim()) {
      return NextResponse.json({ error: "店番を入力してください" }, { status: 400 });
    }
    if (!body.store_name?.trim()) {
      return NextResponse.json({ error: "店名を入力してください" }, { status: 400 });
    }
    if (!body.expense_date) {
      return NextResponse.json({ error: "費用発生日を入力してください" }, { status: 400 });
    }
    if (!body.account_item_code) {
      return NextResponse.json({ error: "勘定項目を選択してください" }, { status: 400 });
    }
    if (!body.description?.trim()) {
      return NextResponse.json({ error: "項目名を入力してください" }, { status: 400 });
    }
    if (body.amount === undefined || body.amount === null) {
      return NextResponse.json({ error: "金額を入力してください" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Calculate invoice_month from expense_date if not provided
    let invoiceMonth = body.invoice_month;
    if (!invoiceMonth && body.expense_date) {
      const date = new Date(body.expense_date);
      invoiceMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        store_code: body.store_code.trim(),
        store_name: body.store_name.trim(),
        expense_date: body.expense_date,
        account_item_code: body.account_item_code,
        description: body.description.trim(),
        expense_type: body.expense_type || "課税分",
        amount: body.amount,
        import_source: body.import_source || "manual",
        import_batch_id: body.import_batch_id || null,
        invoice_month: invoiceMonth,
        review_status: "pending",
        reviewer_account_id: body.reviewer_account_id || null,
      })
      .select()
      .single();

    if (expenseError) {
      console.error("Failed to create expense:", expenseError);
      return NextResponse.json({ error: "費用の作成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      expense: expense,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "費用の作成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
