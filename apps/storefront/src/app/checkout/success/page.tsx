import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

type SuccessPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps): Promise<ReactElement> {
  // Redirect to login if not authenticated
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const params = await searchParams;
  const orderId = params.orderId;

  return (
    <div className="container px-4 py-16 md:px-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 rounded-full bg-green-100 p-3 w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">ご注文ありがとうございます</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              ご注文を受け付けました。確認メールをお送りしましたのでご確認ください。
            </p>
            {orderId && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">注文番号</p>
                <p className="font-mono font-semibold">{orderId}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Link href="/account/orders" className="w-full">
              <Button className="w-full" variant="default">
                <Package className="h-4 w-4 mr-2" />
                注文履歴を見る
              </Button>
            </Link>
            <Link href="/products" className="w-full">
              <Button className="w-full" variant="outline">
                買い物を続ける
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
