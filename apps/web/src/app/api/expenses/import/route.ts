import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import * as XLSX from "xlsx";
import {
  mapRowToExpense,
  convertExpensesToRecords,
  insertExpensesInBatches,
  createImportBatch,
  updateImportBatch,
  type ExpenseRow,
} from "@enterprise/domain-settlement";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const autoApprove = formData.get("autoApprove") === "true";

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
    const fileType = isCSV ? "csv" : "xlsx";

    // Use domain package to create import batch
    const batch = await createImportBatch(
      supabase,
      file.name,
      fileType,
      dataRows.length
    );

    if (!batch) {
      return NextResponse.json(
        { error: "インポートバッチの作成に失敗しました" },
        { status: 500 }
      );
    }

    const batchId = batch.id;
    const errors: string[] = [];
    const validExpenses: ExpenseRow[] = [];
    let failedCount = 0;

    // Process each row and collect valid expenses
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i] as unknown[];
      if (!row || row.length === 0 || row.every((cell) => !cell)) {
        continue; // Skip empty rows
      }

      // Create row object with headers as keys
      const rowObj: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = row[idx];
        rowObj[idx] = row[idx];
      });

      const expense = mapRowToExpense(rowObj, headers, XLSX.SSF.parse_date_code);

      if (!expense) {
        failedCount++;
        errors.push(`行 ${i + 2}: 必須フィールドが不足しています`);
        continue;
      }

      validExpenses.push(expense);
    }

    // Use domain package to convert and insert expenses
    const expenseRecords = convertExpensesToRecords(
      validExpenses,
      batchId,
      fileType,
      { autoApprove }
    );

    const insertResult = await insertExpensesInBatches(
      supabase,
      expenseRecords
    );

    // Update counts and errors
    const successCount = insertResult.successCount;
    failedCount += insertResult.failedCount;
    errors.push(...insertResult.errors);

    // Use domain package to update batch status
    await updateImportBatch(
      supabase,
      batchId,
      successCount,
      failedCount,
      dataRows.length,
      errors
    );

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
