import Link from "next/link";
import { Header } from "@/components/header";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";

const activities = [
  {
    id: "1",
    title: "リトミック体験会（無料）",
    type: "体験",
    description: "初めての方向けの無料体験セッション",
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
    description: "3-5歳児への効果的な指導テクニック",
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
    description: "実際のクラスを見学できます",
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
    description: "中級資格取得のための必須研修",
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">体験・研修一覧</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            体験会、見学会、研修プログラムに参加して実践的なスキルを身につけましょう
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <select className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto">
              <option>全ての種類</option>
              <option>体験</option>
              <option>見学</option>
              <option>研修</option>
            </select>
            <select className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto">
              <option>全ての地域</option>
              <option>東京</option>
              <option>大阪</option>
              <option>オンライン</option>
            </select>
            <select className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto">
              <option>全ての価格</option>
              <option>無料</option>
              <option>有料</option>
            </select>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4 sm:space-y-6">
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
    <div className="bg-white rounded-lg border p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              activity.type === "体験" ? "bg-green-100 text-green-700" :
              activity.type === "見学" ? "bg-blue-100 text-blue-700" :
              "bg-purple-100 text-purple-700"
            }`}>
              {activity.type}
            </span>
            {isPremium && (
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                プレミアム会員限定
              </span>
            )}
            {isFull && (
              <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                満席
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold mb-2">{activity.title}</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">{activity.description}</p>

          {activity.requiredQualification && (
            <p className="text-sm text-amber-600 mb-3 bg-amber-50 px-3 py-2 rounded">
              ⚠️ 必要資格: {activity.requiredQualification}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {activity.date}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {activity.location}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              {activity.enrolled}/{activity.capacity}名 ({availableSeats}席空き)
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              {activity.price === 0 ? "無料" : `¥${activity.price.toLocaleString()}`}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between md:w-48 w-full">
          <div className="text-right mb-4">
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {activity.price === 0 ? "無料" : `¥${activity.price.toLocaleString()}`}
            </div>
            {activity.price > 0 && (
              <div className="text-sm text-muted-foreground">参加費</div>
            )}
          </div>

          <Link
            href={`/activities/${activity.id}`}
            className={`block text-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm ${
              isFull
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {isFull ? "満席" : "詳細・申し込み"}
          </Link>
        </div>
      </div>
    </div>
  );
}
