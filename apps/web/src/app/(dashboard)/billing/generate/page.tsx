import { DashboardHeader } from "@/components/dashboard/header";
import { InvoiceGeneratorClient } from "./invoice-generator-client";

export default function InvoiceGeneratePage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="請求書生成" />
      <InvoiceGeneratorClient />
    </div>
  );
}
