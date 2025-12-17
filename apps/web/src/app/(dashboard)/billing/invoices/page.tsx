import { DashboardHeader } from "@/components/dashboard/header";
import { InvoicesClient, type Invoice } from "./invoices-client";

// Mock data - will be replaced with database data later
const invoices: Invoice[] = [
  { id: "INV-2025-001", customer: "全国教室会費", amount: "¥45,000", status: "発行済み", issueDate: "2025-12-05" },
  { id: "INV-2025-002", customer: "教材販売", amount: "¥128,800", status: "下書き", issueDate: "2025-12-07" },
  { id: "INV-2025-003", customer: "研修受講料", amount: "¥72,000", status: "送付済み", issueDate: "2025-12-09" },
  { id: "INV-2025-004", customer: "全国教室会費", amount: "¥42,000", status: "発行済み", issueDate: "2025-11-05" },
  { id: "INV-2025-005", customer: "教材販売", amount: "¥98,000", status: "送付済み", issueDate: "2025-11-10" },
];

export default function BillingInvoicesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="請求一覧" />
      <InvoicesClient invoices={invoices} />
    </div>
  );
}
