"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

type Venue = {
  id: string;
  name: string;
  code: string;
  type: "対面" | "オンライン";
  address: string;
  capacity: number;
  isActive: boolean;
};

const mockVenues: Venue[] = [
  {
    id: "tokyo-hq",
    name: "東京本部",
    code: "1001",
    type: "対面",
    address: "東京都千代田区丸の内1-1-1",
    capacity: 80,
    isActive: true,
  },
  {
    id: "aomori-hall",
    name: "青森市民ホール",
    code: "2111",
    type: "対面",
    address: "青森県青森市中央1-2-3",
    capacity: 120,
    isActive: true,
  },
  {
    id: "online-zoom",
    name: "オンライン（Zoom会場）",
    code: "9001",
    type: "オンライン",
    address: "ZoomミーティングURL",
    capacity: 500,
    isActive: true,
  },
];

function getInitialVenue(id: string): Venue | null {
  return mockVenues.find((v) => v.id === id) ?? null;
}

export default function EditVenuePage({ params }: { params: { id: string } }) {
  const initial = getInitialVenue(params.id);
  const [formData, setFormData] = useState<Venue | null>(initial);

  if (!formData) {
    return (
      <div className="p-8">
        <DashboardHeader
          title="会場編集"
          actions={
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              会場一覧に戻る
            </Link>
          }
        />
        <p className="mt-6 text-sm text-gray-600">指定された会場が見つかりませんでした。</p>
      </div>
    );
  }

  const handleSubmit = () => {
    console.log("Update venue:", formData);
  };

  return (
    <div className="p-8">
      <DashboardHeader
        title="会場を編集"
        actions={
          <div className="flex gap-3">
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              会場一覧に戻る
            </Link>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              変更を保存
            </button>
          </div>
        }
      />

      <div className="mt-6 max-w-3xl space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">会場情報</h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block font-medium text-gray-700">会場名 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-gray-700">会場コード *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-gray-700">種別 *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as "対面" | "オンライン" })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="対面">対面</option>
                  <option value="オンライン">オンライン</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                {formData.type === "対面" ? "住所 *" : "オンラインURL *"}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-gray-700">定員</label>
                <input
                  type="number"
                  min={0}
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: Number(e.target.value || "0") })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-gray-700">ステータス</label>
                <select
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value === "active" })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">有効</option>
                  <option value="inactive">無効</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-blue-50 p-6 text-sm text-blue-900">
          <h3 className="mb-2 font-bold">編集について</h3>
          <ul className="space-y-1">
            <li>・現在はモックデータのため、保存するとコンソールに内容が出力されるのみです。</li>
            <li>・後続でAPIを接続し、会場マスタテーブルを更新する想定です。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
