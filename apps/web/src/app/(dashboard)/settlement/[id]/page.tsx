import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettlementDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title={`Settlement / Statement / ${id}`} />
      <div className="p-4">
        <Card>
          <CardContent className="p-6 space-y-2 text-sm">
            <div className="text-muted-foreground">This is a placeholder for settlement statement details.</div>
            <div>ID: {id}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
