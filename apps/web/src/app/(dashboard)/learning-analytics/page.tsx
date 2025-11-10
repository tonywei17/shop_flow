import { DashboardHeader } from "@/components/dashboard/header";
import { TrendingUp, Users, DollarSign, BookOpen, Award, Calendar } from "lucide-react";

export default function LearningAnalyticsPage() {
  return (
    <div className="p-8">
      <DashboardHeader title="学習データ分析" />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="総収入（今月）"
          value="¥2,456,000"
          change="+18.2%"
          icon={<DollarSign className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="アクティブ会員"
          value="1,089"
          change="+12.5%"
          icon={<Users className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="コース完了率"
          value="68.4%"
          change="+5.3%"
          icon={<BookOpen className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="資格取得者"
          value="234"
          change="+22.1%"
          icon={<Award className="h-6 w-6" />}
          trend="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">収入推移（過去6ヶ月）</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[
              { month: "6月", value: 1800000 },
              { month: "7月", value: 2100000 },
              { month: "8月", value: 1950000 },
              { month: "9月", value: 2300000 },
              { month: "10月", value: 2200000 },
              { month: "11月", value: 2456000 },
            ].map((data, i) => {
              const maxValue = 2500000;
              const heightPx = (data.value / maxValue) * 200; // 200px max height
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium text-gray-600">
                    ¥{(data.value / 10000).toFixed(0)}万
                  </div>
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${heightPx}px` }}
                    title={`${data.month}: ¥${data.value.toLocaleString()}`}
                  />
                  <div className="text-xs text-gray-600">{data.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Growth */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">会員数推移</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[
              { month: "6月", premium: 380, free: 620 },
              { month: "7月", premium: 395, free: 680 },
              { month: "8月", premium: 410, free: 710 },
              { month: "9月", premium: 425, free: 735 },
              { month: "10月", premium: 442, free: 760 },
              { month: "11月", premium: 456, free: 778 },
            ].map((data, i) => {
              const total = data.premium + data.free;
              const maxTotal = 1300;
              const premiumHeightPx = (data.premium / maxTotal) * 200;
              const freeHeightPx = (data.free / maxTotal) * 200;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium text-gray-600">{total}</div>
                  <div className="w-full flex flex-col-reverse gap-0.5">
                    <div
                      className="w-full bg-gray-300 rounded-b"
                      style={{ height: `${freeHeightPx}px` }}
                      title={`無料: ${data.free}`}
                    />
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${premiumHeightPx}px` }}
                      title={`プレミアム: ${data.premium}`}
                    />
                  </div>
                  <div className="text-xs text-gray-600">{data.month}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-sm text-gray-700">プレミアム</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded" />
              <span className="text-sm text-gray-700">無料</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Sources */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">収入源別内訳</h3>
          <div className="space-y-4">
            <RevenueSourceItem label="会員費" amount={1456000} percentage={59} color="bg-blue-500" />
            <RevenueSourceItem label="コース販売" amount={680000} percentage={28} color="bg-green-500" />
            <RevenueSourceItem label="活動参加費" amount={320000} percentage={13} color="bg-purple-500" />
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center font-bold text-gray-900">
              <span>合計</span>
              <span>¥2,456,000</span>
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">人気コースTOP5</h3>
          <div className="space-y-3">
            <CourseRankItem rank={1} title="リトミック基礎コース" students={245} />
            <CourseRankItem rank={2} title="リトミック指導法 中級" students={189} />
            <CourseRankItem rank={3} title="リトミック教育学" students={156} />
            <CourseRankItem rank={4} title="リトミック上級指導者養成" students={98} />
            <CourseRankItem rank={5} title="幼児教育とリトミック" students={87} />
          </div>
        </div>

        {/* Qualification Stats */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">資格取得状況</h3>
          <div className="space-y-4">
            <QualificationItem
              title="初級指導者資格"
              obtained={156}
              inProgress={89}
              color="bg-green-500"
            />
            <QualificationItem
              title="中級指導者資格"
              obtained={58}
              inProgress={45}
              color="bg-blue-500"
            />
            <QualificationItem
              title="上級指導者資格"
              obtained={20}
              inProgress={12}
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">活動・研修参加状況</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">45</div>
            <div className="text-sm text-gray-600">今月開催</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">892</div>
            <div className="text-sm text-gray-600">総参加者数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">94.2%</div>
            <div className="text-sm text-gray-600">参加率</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">4.8</div>
            <div className="text-sm text-gray-600">平均評価</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <div className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
        <TrendingUp className="h-4 w-4" />
        <span>{change}</span>
        <span className="text-gray-500">vs 先月</span>
      </div>
    </div>
  );
}

function RevenueSourceItem({
  label,
  amount,
  percentage,
  color,
}: {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-sm font-bold text-gray-900">¥{amount.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
    </div>
  );
}

function CourseRankItem({ rank, title, students }: { rank: number; title: string; students: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
        <div className="text-xs text-gray-500">{students}名受講中</div>
      </div>
    </div>
  );
}

function QualificationItem({
  title,
  obtained,
  inProgress,
  color,
}: {
  title: string;
  obtained: number;
  inProgress: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-900">{title}</span>
        <span className="text-sm font-bold text-gray-900">{obtained}名</span>
      </div>
      <div className="flex gap-2 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          取得済み: {obtained}
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          取得中: {inProgress}
        </span>
      </div>
    </div>
  );
}
