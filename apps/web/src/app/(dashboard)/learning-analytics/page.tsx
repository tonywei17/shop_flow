import { DashboardHeader } from "@/components/dashboard/header";
import { TrendingUp, Users, DollarSign, BookOpen, Award } from "lucide-react";

export default function LearningAnalyticsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="学習データ分析" />

      {/* Key Metrics */}
      <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">収入推移（過去6ヶ月）</h3>
          <div className="flex h-64 items-end justify-between gap-2">
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
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    ¥{(data.value / 10000).toFixed(0)}万
                  </div>
                  <div
                    className="w-full cursor-pointer rounded-t bg-primary transition-colors hover:bg-primary/90"
                    style={{ height: `${heightPx}px` }}
                    title={`${data.month}: ¥${data.value.toLocaleString()}`}
                  />
                  <div className="text-xs text-muted-foreground">{data.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Growth */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">会員数推移</h3>
          <div className="flex h-64 items-end justify-between gap-2">
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
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="text-xs font-medium text-muted-foreground">{total}</div>
                  <div className="flex w-full flex-col-reverse gap-0.5">
                    <div
                      className="w-full rounded-b bg-muted"
                      style={{ height: `${freeHeightPx}px` }}
                      title={`無料: ${data.free}`}
                    />
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{ height: `${premiumHeightPx}px` }}
                      title={`プレミアム: ${data.premium}`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{data.month}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary" />
              <span className="text-sm text-muted-foreground">プレミアム</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-muted" />
              <span className="text-sm text-muted-foreground">無料</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue Sources */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">収入源別内訳</h3>
          <div className="space-y-4">
            <RevenueSourceItem label="会員費" amount={1456000} percentage={59} color="bg-primary" />
            <RevenueSourceItem label="コース販売" amount={680000} percentage={28} color="bg-secondary" />
            <RevenueSourceItem label="活動参加費" amount={320000} percentage={13} color="bg-accent" />
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>合計</span>
              <span>¥2,456,000</span>
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">人気コースTOP5</h3>
          <div className="space-y-3">
            <CourseRankItem rank={1} title="リトミック基礎コース" students={245} />
            <CourseRankItem rank={2} title="リトミック指導法 中級" students={189} />
            <CourseRankItem rank={3} title="リトミック教育学" students={156} />
            <CourseRankItem rank={4} title="リトミック上級指導者養成" students={98} />
            <CourseRankItem rank={5} title="幼児教育とリトミック" students={87} />
          </div>
        </div>

        {/* Qualification Stats */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">資格取得状況</h3>
          <div className="space-y-4">
            <QualificationItem
              title="初級指導者資格"
              obtained={156}
              inProgress={89}
              color="bg-primary"
            />
            <QualificationItem
              title="中級指導者資格"
              obtained={58}
              inProgress={45}
              color="bg-secondary"
            />
            <QualificationItem
              title="上級指導者資格"
              obtained={20}
              inProgress={12}
              color="bg-accent"
            />
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground">活動・研修参加状況</h3>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-primary">45</div>
            <div className="text-sm text-muted-foreground">今月開催</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-primary">892</div>
            <div className="text-sm text-muted-foreground">総参加者数</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-primary">94.2%</div>
            <div className="text-sm text-muted-foreground">参加率</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-primary">4.8</div>
            <div className="text-sm text-muted-foreground">平均評価</div>
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
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="mb-2 text-3xl font-bold text-foreground">{value}</div>
      <div className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-primary" : "text-destructive"}`}>
        <TrendingUp className="h-4 w-4" />
        <span>{change}</span>
        <span className="text-muted-foreground">vs 先月</span>
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
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">¥{amount.toLocaleString()}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{percentage}%</div>
    </div>
  );
}

function CourseRankItem({ rank, title, students }: { rank: number; title: string; students: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{students}名受講中</div>
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
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm font-bold text-foreground">{obtained}名</span>
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          取得済み: {obtained}
        </span>
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-muted" />
          取得中: {inProgress}
        </span>
      </div>
    </div>
  );
}
