import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

type UpdateExpenseRequest = {
  store_code?: string;
  store_name?: string;
  expense_date?: string;
  account_item_code?: string;
  description?: string;
  expense_type?: string;
  amount?: number;
  review_status?: string;
  reviewer_account_id?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error: deleteError } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete expense:", deleteError);
      return NextResponse.json({ error: "費用の削除に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "費用の削除中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateExpenseRequest = await request.json();

    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Build update object
    const updateData: Record<string, unknown> = {};
    
    // Expense data fields
    if (body.store_code !== undefined) {
      updateData.store_code = body.store_code;
    }
    if (body.store_name !== undefined) {
      updateData.store_name = body.store_name;
    }
    if (body.expense_date !== undefined) {
      updateData.expense_date = body.expense_date;
    }
    if (body.account_item_code !== undefined) {
      updateData.account_item_code = body.account_item_code;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.expense_type !== undefined) {
      updateData.expense_type = body.expense_type;
    }
    if (body.amount !== undefined) {
      updateData.amount = body.amount;
    }
    
    // Review fields
    if (body.review_status !== undefined) {
      updateData.review_status = body.review_status;
    }
    if (body.reviewer_account_id !== undefined) {
      updateData.reviewer_account_id = body.reviewer_account_id;
    }
    if (body.reviewed_at !== undefined) {
      updateData.reviewed_at = body.reviewed_at;
    }
    if (body.review_note !== undefined) {
      updateData.review_note = body.review_note;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "更新するフィールドがありません" }, { status: 400 });
    }

    const { data: expense, error: updateError } = await supabase
      .from("expenses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update expense:", updateError);
      return NextResponse.json({ error: "費用の更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      expense: expense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "費用の更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
