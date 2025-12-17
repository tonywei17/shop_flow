import { DashboardHeader } from "@/components/dashboard/header";
import { getSupabaseAdmin } from "@enterprise/db";
import { ExpensesClient, type Expense, type AccountItem } from "./expenses-client";

async function getExpenses(): Promise<{ expenses: Expense[]; error: string | null }> {
  try {
    const sb = getSupabaseAdmin();

    const { data: expenses, error } = await sb
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

    if (error) {
      console.error("[billing/expenses] Failed to fetch expenses:", error);
      return { expenses: [], error: "費用データの取得に失敗しました" };
    }

    return { expenses: expenses || [], error: null };
  } catch (err) {
    console.error("[billing/expenses] Unexpected error:", err);
    return { expenses: [], error: "予期しないエラーが発生しました" };
  }
}

async function getAccountItems(): Promise<AccountItem[]> {
  try {
    const sb = getSupabaseAdmin();
    const { data: items, error } = await sb
      .from("account_items")
      .select("id, account_item_id, name")
      .order("account_item_id");

    if (error) {
      console.error("[billing/expenses] Failed to fetch account items:", error);
      return [];
    }

    // Map account_item_id to code for compatibility
    return (items || []).map((item: any) => ({
      id: item.id,
      code: String(item.account_item_id),
      name: item.name,
    }));
  } catch (err) {
    console.error("[billing/expenses] Unexpected error fetching account items:", err);
    return [];
  }
}

export default async function ExpensesPage() {
  const [{ expenses, error }, accountItems] = await Promise.all([
    getExpenses(),
    getAccountItems(),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader title="その他費用管理" />
      <ExpensesClient expenses={expenses} accountItems={accountItems} error={error} />
    </div>
  );
}
