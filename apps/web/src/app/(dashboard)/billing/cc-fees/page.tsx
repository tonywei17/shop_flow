import { DashboardHeader } from "@/components/dashboard/header";
import { CcFeesClient, type CcFee } from "./cc-fees-client";

// Mock data - will be replaced with database data later
const memberships: CcFee[] = [
  { id: "CC-2025-01", center: "東京第一支局", members: 58, amount: "¥116,000", period: "2025年12月" },
  { id: "CC-2025-02", center: "名古屋支局", members: 34, amount: "¥68,000", period: "2025年12月" },
  { id: "CC-2025-03", center: "大阪支局", members: 42, amount: "¥84,000", period: "2025年12月" },
  { id: "CC-2025-04", center: "東京第一支局", members: 55, amount: "¥110,000", period: "2025年11月" },
  { id: "CC-2025-05", center: "名古屋支局", members: 32, amount: "¥64,000", period: "2025年11月" },
  { id: "CC-2025-06", center: "大阪支局", members: 40, amount: "¥80,000", period: "2025年11月" },
];

export default function CcFeesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="CC会費管理" />
      <CcFeesClient fees={memberships} />
    </div>
  );
}
