"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { useState } from "react";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-0">
                {/* テーブルヘッダー */}
                <div className="flex items-center justify-between border-b border-border px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Checkbox aria-label="全て選択" />
                    <span className="text-sm text-muted-foreground">全て選択</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="資格名で検索" className="w-[160px]" />
                    <Button variant="outline" size="sm">検索</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      エクスポート
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <SortableTableHead sortKey="" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[40px] pl-6 cursor-default hover:bg-transparent">
                        <span className="sr-only">選択</span>
                      </SortableTableHead>
                      <SortableTableHead sortKey="sortOrder" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[80px]">
                        順番
                      </SortableTableHead>
                      <SortableTableHead sortKey="name" currentSortKey={null} currentSortOrder={null} onSort={() => {}}>
                        資格名
                      </SortableTableHead>
                      <SortableTableHead sortKey="code" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[100px]">
                        コード
                      </SortableTableHead>
                      <SortableTableHead sortKey="category" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[100px]">
                        カテゴリ
                      </SortableTableHead>
                      <SortableTableHead sortKey="isActive" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[80px]">
                        ステータス
                      </SortableTableHead>
                      <SortableTableHead sortKey="" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[160px] text-right cursor-default hover:bg-transparent">
                        操作
                      </SortableTableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((q, index) => {
                      const isFirst = index === 0;
                      const isLast = index === sortedItems.length - 1;
                      return (
                        <TableRow key={q.id} className="border-b border-border">
                          <TableCell className="pl-6">
                            <Checkbox aria-label={`${q.name} を選択`} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground">{q.sortOrder}</span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleMove(q.id, "up")} disabled={isFirst}>
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleMove(q.id, "down")} disabled={isLast}>
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{q.name}</TableCell>
                          <TableCell className="text-muted-foreground">{q.code}</TableCell>
                          <TableCell className="text-muted-foreground">{q.category}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${q.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {q.isActive ? "有効" : "無効"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Link href={`/qualifications/${q.id}/edit`}><Edit className="h-4 w-4" /></Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleToggleActive(q.id)}>
                                {q.isActive ? "無効" : "有効"}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(q.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* フッター */}
                <div className="flex items-center justify-between border-t border-border px-6 py-3">
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled>
                    一括削除
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    全 {sortedItems.length} 件 (1/1ページ)
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">表示件数:</span>
                      <div className="flex gap-1">
                        {[20, 50, 100].map((size) => (
                          <Button key={size} variant={size === 20 ? "default" : "outline"} size="sm" className="h-7 px-2 text-xs">
                            {size}件
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" disabled>前へ</Button>
                      <span className="px-2 text-sm">1</span>
                      <Button variant="ghost" size="sm" disabled>次へ</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
