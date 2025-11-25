"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { useState } from "react";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";

type Qualification = {
  id: string;
  name: string;
  code: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
};

const initialQualifications: Qualification[] = [
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

export default function QualificationsManagementPage() {
  const [items, setItems] = useState<Qualification[]>(initialQualifications);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCategory, setNewCategory] = useState("指導者資格");

  const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAdd = () => {
    const name = newName.trim();
    const code = newCode.trim();
    const category = newCategory.trim() || "その他";
    if (!name || !code) return;

    const maxOrder = items.length ? Math.max(...items.map((q) => q.sortOrder)) : 0;
    const next: Qualification = {
      id: `ql-${Date.now()}`,
      name,
      code,
      category,
      sortOrder: maxOrder + 1,
      isActive: true,
    };

    setItems((prev) => [...prev, next]);
    setNewName("");
    setNewCode("");
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((q) => q.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setItems((prev) => prev.map((q) => (q.id === id ? { ...q, isActive: !q.isActive } : q)));
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    setItems((prev) => {
      const ordered = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const index = ordered.findIndex((q) => q.id === id);
      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= ordered.length) return prev;

      const current = ordered[index];
      const target = ordered[targetIndex];
      const next = ordered.map((q) => {
        if (q.id === current.id) return { ...q, sortOrder: target.sortOrder };
        if (q.id === target.id) return { ...q, sortOrder: current.sortOrder };
        return q;
      });

      return next;
    });
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="資格管理" />

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">資格一覧</h2>

            {/* Add new qualification */}
            <div className="mb-6 space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-foreground">資格名 *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="例：初級指導者資格"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">コード *</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="例：QL-004"
                  />
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-foreground">カテゴリ</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="例：指導者資格"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newCode.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  資格を追加
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">順番</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">資格名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">コード</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">カテゴリ</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">ステータス</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((q, index) => {
                    const isFirst = index === 0;
                    const isLast = index === sortedItems.length - 1;

                    return (
                      <tr key={q.id} className="border-t border-border hover:bg-muted/60">
                        <td className="px-4 py-2 align-top text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>{q.sortOrder}</span>
                            <button
                              type="button"
                              onClick={() => handleMove(q.id, "up")}
                              disabled={isFirst}
                              className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(q.id, "down")}
                              disabled={isLast}
                              className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 align-top">
                          <span className="font-medium text-foreground">{q.name}</span>
                        </td>
                        <td className="px-4 py-2 align-top">
                          <span className="text-foreground">{q.code}</span>
                        </td>
                        <td className="px-4 py-2 align-top">
                          <span className="text-foreground">{q.category}</span>
                        </td>
                        <td className="px-4 py-2 align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              q.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {q.isActive ? "有効" : "無効"}
                          </span>
                        </td>
                        <td className="px-4 py-2 align-top">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Link
                              href={`/qualifications/${q.id}/edit`}
                              className="inline-flex items-center justify-center rounded-lg border border-border px-2.5 py-1.5 font-medium text-foreground hover:bg-muted"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(q.id)}
                              className="inline-flex items-center justify-center rounded-lg border border-border px-2.5 py-1.5 font-medium text-foreground hover:bg-muted"
                            >
                              {q.isActive ? "無効にする" : "有効にする"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(q.id)}
                              className="inline-flex items-center justify-center rounded-lg border border-destructive/40 px-2.5 py-1.5 font-medium text-destructive hover:bg-destructive/10"
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
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-sm font-bold text-foreground">使い方</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>・ここで管理した資格は、試験や活動の「必要資格」選択で利用する想定です。</li>
              <li>・順番を変更すると、選択肢の表示順にも反映される設計にできます。</li>
              <li>・無効にした資格は新規作成画面では選択できない想定です。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
