import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    
    const billingMonth = searchParams.get("billing_month");
    const invoiceType = searchParams.get("type") || "branch";
    
    if (!billingMonth) {
      return NextResponse.json(
        { error: "billing_month is required" },
        { status: 400 }
      );
    }

    // Get sender email from environment variable
    const senderEmail = process.env.INVOICE_SENDER_EMAIL || process.env.SMTP_FROM_EMAIL || "billing@example.com";
    const senderName = process.env.INVOICE_SENDER_NAME || "リトミック研究センター 経理部";

    // Get recipients based on invoice type
    const recipients = await getRecipients(supabase, billingMonth, invoiceType);

    return NextResponse.json({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      recipients,
    });
  } catch (error) {
    console.error("Error in GET /api/invoices/email-settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface Recipient {
  id: string;
  store_code: string;
  branch_name: string;
  manager_name: string | null;
  contact_email: string | null;
  email_source: "department" | "account" | null;
  member_count: number;
  amount: number;
}

async function getRecipients(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  billingMonth: string,
  invoiceType: string
): Promise<Recipient[]> {
  // Get CC members data grouped by branch
  const isBankTransfer = invoiceType === "agency";
  
  const { data: members } = await supabase
    .from("cc_members")
    .select("branch_code, branch_name, total_count, amount")
    .eq("billing_month", billingMonth)
    .eq("is_excluded", false)
    .eq("is_bank_transfer", isBankTransfer);

  if (!members || members.length === 0) {
    return [];
  }

  // Group by branch
  const branchMap = new Map<string, {
    branch_name: string;
    member_count: number;
    amount: number;
  }>();

  for (const member of members) {
    if (!member.branch_code) continue;
    
    const existing = branchMap.get(member.branch_code);
    if (existing) {
      existing.member_count += member.total_count || 0;
      existing.amount += member.amount || 0;
    } else {
      branchMap.set(member.branch_code, {
        branch_name: member.branch_name || "",
        member_count: member.total_count || 0,
        amount: member.amount || 0,
      });
    }
  }

  // Get department info with manager_name
  // First, get all 支局 type departments
  const { data: branchDepartments } = await supabase
    .from("departments")
    .select("id, name, store_code, manager_name")
    .eq("type", "支局")
    .in("status", ["有効", "active"]);

  // Create a map of branch_code (4 digits) to department info
  interface DeptInfo {
    id: string;
    name: string;
    store_code: string;
    manager_name: string | null;
  }
  const deptMap = new Map<string, DeptInfo>();
  if (branchDepartments) {
    for (const dept of branchDepartments) {
      if (dept.store_code) {
        // Extract first 4 digits as branch code
        const branchCode = dept.store_code.substring(0, 4);
        deptMap.set(branchCode, {
          id: dept.id,
          name: dept.name,
          store_code: dept.store_code,
          manager_name: dept.manager_name,
        });
      }
    }
  }

  // For branch codes not found in 支局, try to find by 7-digit store_code (e.g., 本部)
  const missingBranchCodes = Array.from(branchMap.keys()).filter(code => !deptMap.has(code));
  if (missingBranchCodes.length > 0) {
    // Convert 4-digit codes to 7-digit format (add "000" suffix for branch offices)
    const storeCodePatterns = missingBranchCodes.map(code => `${code}000`);
    const { data: otherDepartments } = await supabase
      .from("departments")
      .select("id, name, store_code, manager_name")
      .in("store_code", storeCodePatterns)
      .in("status", ["有効", "active"]);

    if (otherDepartments) {
      for (const dept of otherDepartments) {
        if (dept.store_code) {
          const branchCode = dept.store_code.substring(0, 4);
          if (!deptMap.has(branchCode)) {
            deptMap.set(branchCode, {
              id: dept.id,
              name: dept.name,
              store_code: dept.store_code,
              manager_name: dept.manager_name,
            });
          }
        }
      }
    }
  }

  // Collect all department IDs for account email lookup
  const departments = [...(branchDepartments || [])];
  for (const code of missingBranchCodes) {
    const info = deptMap.get(code);
    if (info && !departments.find(d => d.id === info.id)) {
      departments.push({ id: info.id, name: info.name, store_code: info.store_code, manager_name: info.manager_name });
    }
  }

  // Get admin accounts linked to departments to get their emails
  const deptIds = departments?.map((d) => d.id) || [];
  const { data: accounts } = await supabase
    .from("admin_accounts")
    .select("department_id, email")
    .in("department_id", deptIds)
    .in("status", ["有効", "active"]);

  // Create a map of department_id to account email
  const accountEmailMap = new Map<string, string>();
  if (accounts) {
    for (const account of accounts) {
      if (account.department_id && account.email && !accountEmailMap.has(account.department_id)) {
        accountEmailMap.set(account.department_id, account.email);
      }
    }
  }

  // Build recipients list
  const recipients: Recipient[] = [];
  for (const [branchCode, data] of branchMap) {
    const deptInfo = deptMap.get(branchCode);
    
    // Determine email: first try department email (not available in current schema), 
    // then fall back to account email
    let contactEmail: string | null = null;
    let emailSource: "department" | "account" | null = null;
    
    if (deptInfo) {
      // Check if there's an account email for this department
      const accountEmail = accountEmailMap.get(deptInfo.id);
      if (accountEmail) {
        contactEmail = accountEmail;
        emailSource = "account";
      }
    }

    // For store_code: if no department match, convert 4-digit branch code to 7-digit format
    // Branch offices end with "000", e.g., 1110 -> 1110000
    const storeCode = deptInfo?.store_code || `${branchCode}000`;

    recipients.push({
      id: deptInfo?.id || branchCode,
      store_code: storeCode,
      branch_name: deptInfo?.name || data.branch_name,
      manager_name: deptInfo?.manager_name || null,
      contact_email: contactEmail,
      email_source: emailSource,
      member_count: data.member_count,
      amount: data.amount,
    });
  }

  // Sort by store_code
  recipients.sort((a, b) => a.store_code.localeCompare(b.store_code));

  return recipients;
}
