import { DashboardHeader } from "@/components/dashboard/header";
import { CcFeesClient } from "./cc-fees-client";

export default function CcFeesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="CC会員管理" />
      <CcFeesClient />
    </div>
  );
}
