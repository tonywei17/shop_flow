import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react";

type ExperienceVideo = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  views: number;
  status: "公開中" | "下書き";
  requiredMembership: "free" | "premium";
  uploadDate: string;
};

type Experience = {
  id: string;
  title: string;
  type: "体験" | "見学";
  date: string;
  location: string;
  capacity: number;
  enrolled: number;
  price: number;
  status: "公開中" | "下書き" | "終了";
  requiredMembership: "free" | "premium";
  videos: ExperienceVideo[];
};

const experiences: Experience[] = [
  {
    id: "exp-1",
    title: "リトミック体験会（無料）",
    type: "体験",
    date: "2025-11-20 14:00",
    location: "東京本部",
    capacity: 20,
    enrolled: 15,
    price: 0,
    status: "公開中",
    requiredMembership: "free",
    videos: [
      {
        id: "vid-exp-1",
        title: "体験会ダイジェスト",
        duration: "06:40",
        thumbnail: "https://placehold.co/320x180/22c55e/ffffff?text=Video",
        views: 128,
        status: "公開中",
        requiredMembership: "free",
        uploadDate: "2025-09-30",
      },
    ],
  },
  {
    id: "exp-2",
    title: "リトミック見学会",
    type: "見学",
    date: "2025-12-05 13:00",
    location: "オンライン",
    capacity: 50,
    enrolled: 35,
    price: 0,
    status: "公開中",
    requiredMembership: "free",
    videos: [
      {
        id: "vid-exp-2",
        title: "オンライン参加ガイド",
        duration: "08:15",
        thumbnail: "https://placehold.co/320x180/2563eb/ffffff?text=Video",
        views: 212,
        status: "公開中",
        requiredMembership: "free",
        uploadDate: "2025-10-05",
      },
    ],
  },
  {
    id: "exp-3",
    title: "幼児クラス体験レッスン",
    type: "体験",
    date: "2025-12-12 10:00",
    location: "大阪支部",
    capacity: 25,
    enrolled: 18,
    price: 2000,
    status: "下書き",
    requiredMembership: "premium",
    videos: [],
  },
];

const totalExperiences = experiences.length;
const publishedExperiences = experiences.filter((exp) => exp.status === "公開中").length;
const monthlyParticipants = experiences.reduce((sum, exp) => sum + exp.enrolled, 0);
const monthlyRevenue = experiences.reduce((sum, exp) => sum + exp.price * exp.enrolled, 0);
const allVideos = experiences.flatMap((exp) => exp.videos.map((video) => ({ ...video, experienceTitle: exp.title })));

export default function ExperiencesManagementPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="見学・体験管理"
        actions={
          <Link
            href="/experiences/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新規体験を作成
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard title="総イベント数" value={`${totalExperiences}件`} />
        <StatCard title="公開中" value={`${publishedExperiences}件`} />
        <StatCard title="今月の参加者" value={`${monthlyParticipants}名`} />
        <StatCard title="今月の収入" value={`¥${monthlyRevenue.toLocaleString()}`} />
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="体験・見学を検索..."
              className="flex h-9 w-full rounded-lg border border-input bg-background px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <select className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <option>イベント種類</option>
            <option>体験</option>
            <option>見学</option>
          </select>
          <select className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <option>全てのステータス</option>
            <option>公開中</option>
            <option>下書き</option>
            <option>終了</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
        </div>
      </div>

      {/* Experiences Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">イベント名</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">種類</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">日時</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">場所</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">参加状況</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">価格</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">ステータス</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((experience) => (
              <tr key={experience.id} className="border-b border-border hover:bg-muted/60">
                <td className="p-4">
                  <div className="font-medium text-foreground">{experience.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {experience.requiredMembership === "premium" ? "プレミアム会員限定" : "全会員"}
                  </div>
                  {experience.videos.length > 0 && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      動画 {experience.videos.length}件
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      experience.type === "体験" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary-foreground"
                    }`}
                  >
                    {experience.type}
                  </span>
                </td>
                <td className="p-4 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {experience.date}
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {experience.location}
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {experience.enrolled}/{experience.capacity}名
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(experience.enrolled / experience.capacity) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="p-4 text-sm font-medium text-foreground">
                  {experience.price === 0 ? "無料" : `¥${experience.price.toLocaleString()}`}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      experience.status === "公開中" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {experience.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/experiences/${experience.id}`}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="詳細を表示"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="編集">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-destructive hover:bg-destructive/10 hover:text-destructive" title="削除">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allVideos.length > 0 && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">動画コンテンツ</p>
              <p className="text-xs text-muted-foreground">見学・体験イベントに紐づく動画一覧です。</p>
            </div>
            <button className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">動画を追加</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allVideos.map((video) => (
              <ExperienceVideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-2 text-sm text-muted-foreground">{title}</div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function ExperienceVideoCard({ video }: { video: ExperienceVideo & { experienceTitle: string } }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="relative h-40 overflow-hidden rounded-t-xl">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={320}
          height={180}
          className="h-full w-full object-cover"
        />
        <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">{video.duration}</span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{video.experienceTitle}</span>
          <span>{video.uploadDate}</span>
        </div>
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{video.title}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{video.views}回再生</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              video.status === "公開中" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {video.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted">詳細</button>
          <button className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted">編集</button>
        </div>
      </div>
    </div>
  );
}
