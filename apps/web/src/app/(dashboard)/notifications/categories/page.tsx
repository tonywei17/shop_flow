"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";

type NotificationCategory = {
  id: string;
  name: string;
  description?: string;
  colorClass?: string;
  sortOrder: number;
  isActive: boolean;
};

const initialCategories: NotificationCategory[] = [
  { id: "general", name: "お知らせ", colorClass: "bg-blue-100 text-blue-700", sortOrder: 1, isActive: true },
  { id: "exam", name: "資格試験", colorClass: "bg-purple-100 text-purple-700", sortOrder: 2, isActive: true },
  { id: "system", name: "システム", colorClass: "bg-amber-100 text-amber-700", sortOrder: 3, isActive: true },
  { id: "campaign", name: "キャンペーン", colorClass: "bg-emerald-100 text-emerald-700", sortOrder: 4, isActive: true },
];

export default function NotificationCategoriesManagementPage() {
  const [categories, setCategories] = useState<NotificationCategory[]>(initialCategories);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const nextOrder = categories.length ? Math.max(...categories.map((c) => c.sortOrder)) + 1 : 1;
    const next: NotificationCategory = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      sortOrder: nextOrder,
      isActive: true,
    };
    setCategories([...categories, next]);
    setNewName("");
  };

  const handleStartEdit = (category: NotificationCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setCategories(categories.map((c) => (c.id === editingId ? { ...c, name: trimmed } : c)));
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="p-8">
      <DashboardHeader title="通知分類管理" />

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">分類一覧</h2>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">新しい分類を追加</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：キャンペーン"
                  />
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    追加
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">並び順</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">分類名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">ステータス</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map((category) => {
                    const isEditing = editingId === category.id;
                    return (
                      <tr key={category.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{category.sortOrder}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                category.colorClass ?? "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {category.name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              category.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {category.isActive ? "有効" : "無効"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={handleSaveEdit}
                                  className="inline-flex items-center justify-center rounded-lg border border-emerald-500 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingName("");
                                  }}
                                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(category)}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleActive(category.id)}
                              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              {category.isActive ? "無効にする" : "有効にする"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              className="inline-flex items-center justify-center rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-gray-900 mb-4">使い方</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>・分類は通知作成画面で選択可能です。</li>
              <li>・無効にした分類は新規通知では選択できない想定です。</li>
              <li>・将来的には API と接続して、ここでの設定を本番データと同期します。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
