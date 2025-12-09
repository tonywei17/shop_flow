import Link from "next/link";
import { Header } from "@/components/header";
import { Calendar, MapPin, Users, DollarSign, CheckCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const activities = [
  {
    id: "1",
    title: "リトミック体験会（無料）",
    type: "体験",
    description: "初めての方向けの無料体験セッション。リトミックの基礎を楽しく学びます。",
    date: "2025年11月20日 14:00-16:00",
    location: "東京本部",
    capacity: 20,
    enrolled: 15,
    price: 0,
    requiredMembership: "free",
  },
  {
    id: "2",
    title: "幼児指導法ワークショップ",
    type: "研修",
    description: "3-5歳児への効果的な指導テクニック。実践中心のカリキュラムです。",
    date: "2025年11月25日 10:00-17:00",
    location: "大阪支部",
    capacity: 30,
    enrolled: 22,
    price: 8000,
    requiredMembership: "premium",
  },
  {
    id: "3",
    title: "リトミック見学会",
    type: "見学",
    description: "実際のクラスを見学できます。指導者の動きや子供たちの反応を観察しましょう。",
    date: "2025年12月5日 13:00-15:00",
    location: "オンライン",
    capacity: 50,
    enrolled: 35,
    price: 0,
    requiredMembership: "free",
  },
  {
    id: "4",
    title: "中級指導者認定研修",
    type: "研修",
    description: "中級資格取得のための必須研修。理論と実技の両面から深く学びます。",
    date: "2025年12月10日 09:00-18:00",
    location: "東京本部",
    capacity: 25,
    enrolled: 18,
    price: 15000,
    requiredMembership: "premium",
    requiredQualification: "初級指導者資格",
  },
];

export default function ActivitiesPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">体験・研修一覧</h1>
          <p className="text-muted-foreground">
            体験会、見学会、研修プログラムに参加して実践的なスキルを身につけましょう
          </p>
        </div>

        {/* Filters */}
        <div className="bg-background p-4 rounded-lg border mb-8 flex flex-col sm:flex-row gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="全ての種類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ての種類</SelectItem>
              <SelectItem value="experience">体験</SelectItem>
              <SelectItem value="observation">見学</SelectItem>
              <SelectItem value="training">研修</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="全ての地域" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ての地域</SelectItem>
              <SelectItem value="tokyo">東京</SelectItem>
              <SelectItem value="osaka">大阪</SelectItem>
              <SelectItem value="online">オンライン</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="全ての価格" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ての価格</SelectItem>
              <SelectItem value="free">無料</SelectItem>
              <SelectItem value="paid">有料</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: typeof activities[0] }) {
  const isPremium = activity.requiredMembership === "premium";
  const isFull = activity.enrolled >= activity.capacity;
  const availableSeats = activity.capacity - activity.enrolled;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <CardContent className="flex-1 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant="outline" 
              className={`${
                activity.type === "体験" ? "bg-green-50 text-green-700 border-green-200" :
                activity.type === "見学" ? "bg-blue-50 text-blue-700 border-blue-200" :
                "bg-purple-50 text-purple-700 border-purple-200"
              }`}
            >
              {activity.type}
            </Badge>
            {isPremium && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                プレミアム会員限定
              </Badge>
            )}
            {isFull && (
              <Badge variant="destructive">
                満席
              </Badge>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              <Link href={`/activities/${activity.id}`} className="hover:underline">
                {activity.title}
              </Link>
            </h3>
            <p className="text-muted-foreground">{activity.description}</p>
          </div>

          {activity.requiredQualification && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-md border border-amber-100 mb-4">
              <span className="text-amber-500">⚠️</span>
              必要資格: {activity.requiredQualification}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary/70" />
              {activity.date}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary/70" />
              {activity.location}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary/70" />
              <span>
                {activity.enrolled} / {activity.capacity}名 
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">あと{availableSeats}席</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary/70" />
              {activity.price === 0 ? "無料" : `¥${activity.price.toLocaleString()}`}
            </div>
          </div>
        </CardContent>

        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l bg-muted/5 p-6 md:w-64 shrink-0">
          <div className="text-center md:text-right mb-4">
            <div className="text-3xl font-bold text-foreground">
              {activity.price === 0 ? "無料" : `¥${activity.price.toLocaleString()}`}
            </div>
            {activity.price > 0 && (
              <div className="text-xs text-muted-foreground mt-1">税込・教材費込</div>
            )}
          </div>

          <Button 
            asChild 
            className="w-full" 
            size="lg" 
            variant={isFull ? "outline" : "default"}
            disabled={isFull}
          >
            <Link href={`/activities/${activity.id}`}>
              {isFull ? "キャンセル待ち" : "詳細・申し込み"}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

