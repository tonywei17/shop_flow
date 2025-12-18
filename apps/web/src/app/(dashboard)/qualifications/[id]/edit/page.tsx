"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

type Qualification = {
  id: string;
  name: string;
  code: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
};

const mockQualifications: Qualification[] = [
  {
    id: "teacher-basic",
    name: "初級指導者資格",
    code: "QL-001",
    category: "指導者資格",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "teacher-middle",
    name: "中級指導者資格",
    code: "QL-002",
    category: "指導者資格",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "teacher-advanced",
    name: "上級指導者資格",
    code: "QL-003",
    category: "指導者資格",
    sortOrder: 3,
    isActive: true,
  },
];

function getInitialQualification(id: string): Qualification | null {
  return mockQualifications.find((q) => q.id === id) ?? null;
}

export default function EditQualificationPage({ params }: { params: { id: string } }) {
  const initial = getInitialQualification(params.id);
  const [formData, setFormData] = useState<Qualification | null>(initial);

  if (!formData) {
    return (
      <div className="p-8">
        <DashboardHeader
          title="資格編集"
          actions={
            <Link
              href="/qualifications"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              資格一覧に戻る
            </Link>
          }
        />
        <p className="mt-6 text-sm text-gray-600">指定された資格が見つかりませんでした。</p>
      </div>
    );
  }

  const handleSubmit = () => {
    // TODO: 调用API更新资格数据
  };

  return (
    <div className="p-8">
      <DashboardHeader
        title="資格を編集"
        actions={
          <div className="flex gap-3">
            <Link
              href="/qualifications"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              資格一覧に戻る
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
          <h2 className="mb-4 text-lg font-bold text-gray-900">資格情報</h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block font-medium text-gray-700">資格名 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-gray-700">コード *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-gray-700">カテゴリ</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-gray-700">表示順</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: Number(e.target.value || "0") })
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
            <li>・後続でAPIを接続し、資格マスタテーブルを更新する想定です。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
