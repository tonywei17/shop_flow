import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettlementNewPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="Settlement / New Statement" />
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <form className="grid gap-4 max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="period">Period</Label>
                <Input id="period" placeholder="2025-09" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Note</Label>
                <Input id="note" placeholder="Optional note" />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Generate</Button>
                <Button type="button" variant="outline">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
