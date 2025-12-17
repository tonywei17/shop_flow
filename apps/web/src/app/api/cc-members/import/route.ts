import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import * as XLSX from "xlsx";

type FileType = "child_count" | "aigran" | "bank_transfer";

interface ImportResult {
  success: boolean;
  importId: string;
  rowCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const formData = await request.formData();
    
    const file = formData.get("file") as File;
    const fileType = formData.get("file_type") as FileType;
    const billingMonth = formData.get("billing_month") as string;
    
    if (!file || !fileType || !billingMonth) {
      return NextResponse.json(
        { error: "Missing required fields: file, file_type, billing_month" },
        { status: 400 }
      );
    }
    
    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
    
    // Create import batch record
    const { data: importBatch, error: importError } = await supabase
      .from("cc_member_imports")
      .insert({
        import_month: billingMonth,
        file_name: file.name,
        file_type: fileType,
        row_count: rows.length - 1,
        status: "processing",
      })
      .select()
      .single();
    
    if (importError || !importBatch) {
      console.error("Error creating import batch:", importError);
      return NextResponse.json(
        { error: "Failed to create import batch" },
        { status: 500 }
      );
    }
    
    let result: ImportResult;
    
    switch (fileType) {
      case "child_count":
        result = await processChildCountFile(supabase, importBatch.id, billingMonth, rows);
        break;
      case "aigran":
        result = await processAigranFile(supabase, importBatch.id, billingMonth, rows);
        break;
      case "bank_transfer":
        result = await processBankTransferFile(supabase, importBatch.id, billingMonth, rows);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid file_type" },
          { status: 400 }
        );
    }
    
    // Update import batch with results
    await supabase
      .from("cc_member_imports")
      .update({
        success_count: result.successCount,
        error_count: result.errorCount,
        status: result.errorCount > 0 ? "completed" : "completed",
        error_log: result.errors.length > 0 ? { errors: result.errors } : null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", importBatch.id);
    
    return NextResponse.json({
      success: true,
      import_id: importBatch.id,
      row_count: result.rowCount,
      success_count: result.successCount,
      error_count: result.errorCount,
      errors: result.errors.slice(0, 10),
    });
  } catch (error) {
    console.error("Error in POST /api/cc-members/import:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Process child count file (11月度チャイルド数.xlsx)
async function processChildCountFile(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  importId: string,
  billingMonth: string,
  rows: unknown[][]
): Promise<ImportResult> {
  const errors: string[] = [];
  
  // Skip header row
  const dataRows = rows.slice(1);
  
  // Prepare batch data
  const batchData: Record<string, unknown>[] = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length < 10) continue;
    
    const classroomCode = String(row[0] || "");
    const classroomName = String(row[1] || "");
    
    // Skip empty rows
    if (!classroomCode || classroomCode === "undefined") continue;
    
    // Extract branch code (first 4 digits)
    const branchCode = classroomCode.substring(0, 4);
    
    // Check if this is a branch row (ends with 000)
    const isBranchRow = classroomCode.endsWith("000");
    
    // Check if this is an Aigran classroom (ends with 777)
    const isAigran = classroomCode.endsWith("777");
    
    batchData.push({
      import_id: importId,
      billing_month: billingMonth,
      classroom_code: classroomCode,
      classroom_name: classroomName,
      branch_code: branchCode,
      baby_count: Number(row[2]) || 0,
      step1_count: Number(row[3]) || 0,
      step2_count: Number(row[4]) || 0,
      step3_count: Number(row[5]) || 0,
      step4_count: Number(row[6]) || 0,
      step5_count: Number(row[7]) || 0,
      other_count: Number(row[8]) || 0,
      total_count: Number(row[9]) || 0,
      unit_price: 480,
      amount: (Number(row[9]) || 0) * 480,
      is_aigran: isAigran,
      is_bank_transfer: false,
      is_excluded: isBranchRow,
    });
  }
  
  // Batch upsert in chunks of 500
  const BATCH_SIZE = 500;
  let successCount = 0;
  
  for (let i = 0; i < batchData.length; i += BATCH_SIZE) {
    const chunk = batchData.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("cc_members")
      .upsert(chunk, {
        onConflict: "billing_month,classroom_code",
        ignoreDuplicates: false,
      });
    
    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    } else {
      successCount += chunk.length;
    }
  }
  
  return {
    success: errors.length === 0,
    importId,
    rowCount: batchData.length,
    successCount,
    errorCount: errors.length,
    errors,
  };
}

// Process Aigran file (アイグラン11月度.xlsx)
async function processAigranFile(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  importId: string,
  billingMonth: string,
  rows: unknown[][]
): Promise<ImportResult> {
  const errors: string[] = [];
  
  // Skip header rows (first 2 rows)
  const dataRows = rows.slice(2);
  
  // Prepare batch data
  const batchData: Record<string, unknown>[] = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length < 11) continue;
    
    const branchCode = String(row[2] || "");
    const branchName = String(row[3] || "");
    
    if (!branchCode || branchCode === "undefined" || branchCode === "null") continue;
    
    const classroomCode = branchCode + "777";
    
    batchData.push({
      import_id: importId,
      billing_month: billingMonth,
      classroom_code: classroomCode,
      classroom_name: "㈱アイグラン",
      branch_code: branchCode,
      branch_name: branchName,
      baby_count: Number(row[4]) || 0,
      step1_count: Number(row[5]) || 0,
      step2_count: Number(row[6]) || 0,
      step3_count: Number(row[7]) || 0,
      step4_count: Number(row[8]) || 0,
      step5_count: 0,
      other_count: Number(row[9]) || 0,
      total_count: Number(row[10]) || 0,
      unit_price: 600,
      amount: (Number(row[10]) || 0) * 600,
      is_aigran: true,
      is_bank_transfer: false,
      is_excluded: false,
    });
  }
  
  // Batch upsert
  const BATCH_SIZE = 500;
  let successCount = 0;
  
  for (let i = 0; i < batchData.length; i += BATCH_SIZE) {
    const chunk = batchData.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("cc_members")
      .upsert(chunk, {
        onConflict: "billing_month,classroom_code",
        ignoreDuplicates: false,
      });
    
    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    } else {
      successCount += chunk.length;
    }
  }
  
  return {
    success: errors.length === 0,
    importId,
    rowCount: batchData.length,
    successCount,
    errorCount: errors.length,
    errors,
  };
}

// Process bank transfer file (口座振替教室一覧.xlsx)
async function processBankTransferFile(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  importId: string,
  billingMonth: string,
  rows: unknown[][]
): Promise<ImportResult> {
  const errors: string[] = [];
  let successCount = 0;
  
  // Skip header row
  const dataRows = rows.slice(1);
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length < 4) continue;
    
    // Column mapping: [支局コード, 支局, 教室コード, 教室]
    const branchCode = String(row[0] || "");
    const classroomCodeSuffix = String(row[2] || "").padStart(3, "0");
    
    if (!branchCode || branchCode === "undefined") continue;
    
    // Full classroom code = branchCode + classroomCodeSuffix
    // e.g., 1110 + 007 = 1110007
    const classroomCode = branchCode + classroomCodeSuffix;
    
    // Update existing record to mark as bank transfer
    const { error } = await supabase
      .from("cc_members")
      .update({
        is_bank_transfer: true,
        is_excluded: true,
      })
      .eq("billing_month", billingMonth)
      .eq("classroom_code", classroomCode);
    
    if (error) {
      errors.push(`Row ${i + 2}: ${error.message}`);
    } else {
      successCount++;
    }
  }
  
  return {
    success: errors.length === 0,
    importId,
    rowCount: dataRows.length,
    successCount,
    errorCount: errors.length,
    errors,
  };
}
