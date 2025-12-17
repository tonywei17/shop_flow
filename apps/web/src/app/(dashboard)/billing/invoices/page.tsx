import { DashboardHeader } from "@/components/dashboard/header";
import { InvoicesClient } from "./invoices-client";

export default function BillingInvoicesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="請求書一覧" />
      <InvoicesClient />
    </div>
  );
}
