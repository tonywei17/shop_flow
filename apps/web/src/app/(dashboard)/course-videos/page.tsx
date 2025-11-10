import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash2, Play, Lock, Users } from "lucide-react";

// Mock data
const videos = [
  {
    id: "1",
    title: "第1章：リトミックとは",
    course: "リトミック基礎コース",
    duration: "15:30",
    vimeoId: "76979871",
    thumbnail: "https://placehold.co/320x180/3b82f6/ffffff?text=Video+1",
    views: 245,
    status: "公開中",
    requiredMembership: "free",
    uploadDate: "2024-10-15",
  },
  {
    id: "2",
    title: "第2章：基本的な動き",
    course: "リトミック基礎コース",
    duration: "20:15",
    vimeoId: "76979871",
    thumbnail: "https://placehold.co/320x180/3b82f6/ffffff?text=Video+2",
    views: 198,
    status: "公開中",
    requiredMembership: "free",
    uploadDate: "2024-10-16",
  },
  {
    id: "3",
    title: "第1章：中級指導の基礎",
    course: "リトミック指導法 中級",
    duration: "22:30",
    vimeoId: "76979871",
    thumbnail: "https://placehold.co/320x180/8b5cf6/ffffff?text=Video+3",
    views: 156,
    status: "公開中",
    requiredMembership: "premium",
    uploadDate: "2024-10-20",
  },
  {
    id: "4",
    title: "第2章：年齢別アプローチ",
    course: "リトミック指導法 中級",
    duration: "28:15",
    vimeoId: "76979871",
    thumbnail: "https://placehold.co/320x180/8b5cf6/ffffff?text=Video+4",
    views: 142,
    status: "下書き",
    requiredMembership: "premium",
    uploadDate: "2024-10-22",
  },
];

export default function CourseVideosPage() {
  return (
    <div className="p-8">
      <DashboardHeader
        title="動画コンテンツ管理"
        actions={
          <Link
            href="/course-videos/new"
            className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            新規動画を追加
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="総動画数" value="48" />
        <StatCard title="公開中" value="42" />
        <StatCard title="総再生回数" value="12,456" />
        <StatCard title="総再生時間" value="3,245時間" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="動画を検索..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="border rounded-lg px-4 py-2">
            <option>全てのコース</option>
            <option>リトミック基礎コース</option>
            <option>リトミック指導法 中級</option>
            <option>リトミック教育学</option>
          </select>
          <select className="border rounded-lg px-4 py-2">
            <option>全てのステータス</option>
            <option>公開中</option>
            <option>下書き</option>
          </select>
          <button className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function VideoCard({ video }: { video: typeof videos[0] }) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative group">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-white rounded-full p-4 hover:bg-gray-100">
            <Play className="h-6 w-6 text-gray-900" />
          </button>
        </div>
        <div className="absolute top-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs font-medium">
          {video.duration}
        </div>
        {video.status === "下書き" && (
          <div className="absolute top-2 left-2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
            下書き
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded ${
            video.requiredMembership === "premium"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}>
            {video.requiredMembership === "premium" ? "プレミアム" : "無料"}
          </span>
          <span className="text-xs text-gray-500">{video.course}</span>
        </div>
        
        <h3 className="font-bold mb-2 line-clamp-2">{video.title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{video.views}回</span>
          </div>
          <div className="text-xs">{video.uploadDate}</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 border rounded-lg px-3 py-2 hover:bg-gray-50 text-sm">
            <Eye className="h-4 w-4" />
            詳細
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 border rounded-lg px-3 py-2 hover:bg-gray-50 text-sm">
            <Edit className="h-4 w-4" />
            編集
          </button>
          <button className="flex items-center justify-center border rounded-lg px-3 py-2 hover:bg-gray-50 text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
