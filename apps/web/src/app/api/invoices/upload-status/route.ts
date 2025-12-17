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

    // Check CC members import status
    const ccMembersStatus = await getCcMembersImportStatus(supabase, billingMonth);

    // Check expenses import status
    const expensesStatus = await getExpensesImportStatus(supabase, billingMonth);

    return NextResponse.json({
      billing_month: billingMonth,
      child_count: ccMembersStatus.child_count,
      aigran: ccMembersStatus.aigran,
      bank_transfer: ccMembersStatus.bank_transfer,
      expenses: expensesStatus,
    });
  } catch (error) {
    console.error("Error in GET /api/invoices/upload-status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface ImportStatus {
  uploaded: boolean;
  import_id?: string;
  file_name?: string;
  imported_at?: string;
  success_count?: number;
  error_count?: number;
}

async function getCcMembersImportStatus(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string
): Promise<{
  child_count: ImportStatus;
  aigran: ImportStatus;
  bank_transfer: ImportStatus;
}> {
  // Get import records for this billing month
  const { data: imports } = await supabase
    .from("cc_member_imports")
    .select("*")
    .eq("import_month", billingMonth)
    .eq("status", "completed")
    .order("imported_at", { ascending: false });

  const result = {
    child_count: { uploaded: false } as ImportStatus,
    aigran: { uploaded: false } as ImportStatus,
    bank_transfer: { uploaded: false } as ImportStatus,
  };

  if (!imports) return result;

  // Find the latest import for each file type
  for (const imp of imports) {
    const fileType = imp.file_type as "child_count" | "aigran" | "bank_transfer";
    if (fileType in result && !result[fileType].uploaded) {
      result[fileType] = {
        uploaded: true,
        import_id: imp.id,
        file_name: imp.file_name,
        imported_at: imp.imported_at,
        success_count: imp.success_count,
        error_count: imp.error_count,
      };
    }
  }

  // Also check if there's CC members data for this month (even without import record)
  if (!result.child_count.uploaded) {
    const { data: members, count } = await supabase
      .from("cc_members")
      .select("id", { count: "exact" })
      .eq("billing_month", billingMonth)
      .eq("is_aigran", false)
      .eq("is_bank_transfer", false)
      .limit(1);

    if (count && count > 0) {
      result.child_count = {
        uploaded: true,
        success_count: count,
      };
    }
  }

  // Check for aigran data
  if (!result.aigran.uploaded) {
    const { count } = await supabase
      .from("cc_members")
      .select("id", { count: "exact" })
      .eq("billing_month", billingMonth)
      .eq("is_aigran", true)
      .limit(1);

    if (count && count > 0) {
      result.aigran = {
        uploaded: true,
        success_count: count,
      };
    }
  }

  // Check for bank transfer data
  if (!result.bank_transfer.uploaded) {
    const { count } = await supabase
      .from("cc_members")
      .select("id", { count: "exact" })
      .eq("billing_month", billingMonth)
      .eq("is_bank_transfer", true)
      .limit(1);

    if (count && count > 0) {
      result.bank_transfer = {
        uploaded: true,
        success_count: count,
      };
    }
  }

  return result;
}

async function getExpensesImportStatus(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string
): Promise<ImportStatus> {
  // Check if there are expenses for this billing month
  const { data: expenses, count } = await supabase
    .from("expenses")
    .select("id, created_at", { count: "exact" })
    .eq("invoice_month", billingMonth)
    .limit(1);

  if (!count || count === 0) {
    return { uploaded: false };
  }

  // Try to get the latest import batch for this month
  const { data: batch } = await supabase
    .from("expense_import_batches")
    .select("*")
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1);

  if (batch && batch.length > 0) {
    return {
      uploaded: true,
      import_id: batch[0].id,
      file_name: batch[0].file_name,
      imported_at: batch[0].completed_at,
      success_count: count,
    };
  }

  return {
    uploaded: true,
    success_count: count,
  };
}
