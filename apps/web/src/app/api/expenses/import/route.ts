import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import * as XLSX from "xlsx";

type ExpenseRow = {
  store_code: string;
  store_name: string;
  expense_date: string;
  account_item_code: string;
  description: string;
  expense_type: string;
  amount: number;
  reviewer_account_id?: string;
};

// Column name mapping (Japanese to internal)
const COLUMN_MAP: Record<string, keyof ExpenseRow> = {
  "店番": "store_code",
  "店名": "store_name",
  "費用発生日": "expense_date",
  "勘定項目": "account_item_code",
  "項目名": "description",
  "費用タイプ": "expense_type",
  "請求金額": "amount",
  "審査者アカウントID": "reviewer_account_id",
};

function parseAmount(value: string | number): number {
  if (typeof value === "number") return value;
  // Remove tabs, spaces, and currency symbols
  const cleaned = String(value).replace(/[\t\s¥,]/g, "");
  return parseFloat(cleaned) || 0;
}

function parseDate(value: string | number | Date): string {
  if (!value) return "";
  
  // If it's already a date string in YYYY-MM-DD format
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  
  // If it's an Excel serial date number
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }
  
  // Try to parse as date string
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }
  
  return String(value);
}

function mapRowToExpense(row: Record<string, unknown>, headers: string[]): ExpenseRow | null {
  const expense: Partial<ExpenseRow> = {};
  
  headers.forEach((header, index) => {
    const internalKey = COLUMN_MAP[header];
    if (internalKey) {
      const value = row[header] ?? row[index];
      if (value !== undefined && value !== null && value !== "") {
        if (internalKey === "amount") {
          expense[internalKey] = parseAmount(value as string | number);
        } else if (internalKey === "expense_date") {
          expense[internalKey] = parseDate(value as string | number | Date);
        } else {
          expense[internalKey] = String(value).trim();
        }
      }
    }
  });
  
  // Validate required fields
  if (!expense.store_code || !expense.store_name || !expense.expense_date || 
      !expense.account_item_code || !expense.description || expense.amount === undefined) {
    return null;
  }
  
  return expense as ExpenseRow;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルを選択してください" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCSV && !isExcel) {
      return NextResponse.json({ error: "xlsx または csv ファイルを選択してください" }, { status: 400 });
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const rawData = XLSX.utils.sheet_to_json(sheet, { 
      header: 1,
      raw: false,
      dateNF: "yyyy-mm-dd"
    }) as unknown[][];
    
    if (rawData.length < 2) {
      return NextResponse.json({ error: "データが見つかりません" }, { status: 400 });
    }

    // Extract headers and data rows
    const headers = (rawData[0] as string[]).map(h => String(h).trim());
    const dataRows = rawData.slice(1);

    const supabase = getSupabaseAdmin();

    // Create import batch record
    const { data: batch, error: batchError } = await supabase
      .from("expense_import_batches")
      .insert({
        file_name: file.name,
        file_type: isCSV ? "csv" : "xlsx",
        total_records: dataRows.length,
        status: "processing",
      })
      .select()
      .single();

    if (batchError) {
      console.error("Failed to create import batch:", batchError);
      return NextResponse.json({ error: "インポートバッチの作成に失敗しました" }, { status: 500 });
    }

    const batchId = batch.id;
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i] as unknown[];
      if (!row || row.length === 0 || row.every(cell => !cell)) {
        continue; // Skip empty rows
      }

      // Create row object with headers as keys
      const rowObj: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = row[idx];
        rowObj[idx] = row[idx];
      });

      const expense = mapRowToExpense(rowObj, headers);
      
      if (!expense) {
        failedCount++;
        errors.push(`行 ${i + 2}: 必須フィールドが不足しています`);
        continue;
      }

      // Calculate invoice_month
      const expenseDate = new Date(expense.expense_date);
      const invoiceMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;

      // Insert expense
      const { error: insertError } = await supabase
        .from("expenses")
        .insert({
          store_code: expense.store_code,
          store_name: expense.store_name,
          expense_date: expense.expense_date,
          account_item_code: expense.account_item_code,
          description: expense.description,
          expense_type: expense.expense_type || "課税分",
          amount: expense.amount,
          import_source: isCSV ? "csv" : "xlsx",
          import_batch_id: batchId,
          invoice_month: invoiceMonth,
          review_status: "pending",
          reviewer_account_id: expense.reviewer_account_id || null,
        });

      if (insertError) {
        failedCount++;
        errors.push(`行 ${i + 2}: ${insertError.message}`);
      } else {
        successCount++;
      }
    }

    // Update batch status
    await supabase
      .from("expense_import_batches")
      .update({
        success_records: successCount,
        failed_records: failedCount,
        status: failedCount === dataRows.length ? "failed" : "completed",
        error_log: errors.length > 0 ? errors : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      total: dataRows.length,
      successCount: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error) {
    console.error("Error importing expenses:", error);
    return NextResponse.json(
      { error: "インポート中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
