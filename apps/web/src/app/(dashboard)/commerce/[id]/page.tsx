import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";

export default async function CommerceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title={`Commerce / Product / ${id}`} />
      <div className="p-4">
        <Card>
          <CardContent className="p-6 space-y-2 text-sm">
            <div className="text-muted-foreground">This is a placeholder for product details.</div>
            <div>ID: {id}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
