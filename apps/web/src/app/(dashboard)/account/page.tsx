import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="アカウント設定"
        actions={<Button variant="outline">パスワードをリセット</Button>}
      />
      <div className="p-4 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">プロフィール</h2>
              <p className="text-sm text-muted-foreground">氏名や部署など、申請書・注文に利用される基本情報です。</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">氏名</Label>
                <Input id="name" placeholder="山田 太郎" defaultValue="山田 太郎" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" type="email" placeholder="taro@example.com" defaultValue="taro@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">所属部署</Label>
                <Input id="department" placeholder="営業部" defaultValue="営業部" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">ロール</Label>
                <Input id="role" placeholder="承認者" defaultValue="承認者" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>保存</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">通知設定</h2>
              <p className="text-sm text-muted-foreground">受注や申請書の更新タイミングで通知を受け取る設定です。</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notification-email">通知用メール</Label>
              <Input id="notification-email" type="email" placeholder="notification@example.com" defaultValue="taro@example.com" />
            </div>
            <div className="flex justify-end">
              <Button variant="outline">通知設定を更新</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
