'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import type { DepartmentWithParent } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  ChevronDown, 
  ChevronRight, 
  ChevronsDownUp, 
  ChevronsUpDown, 
  Download, 
  Search,
  Receipt,
  MapPin,
  User,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEPARTMENTS_SELECTION_STORAGE_KEY = "departments_selected_ids";
const DEPARTMENTS_EXPANDED_STORAGE_KEY = "departments_expanded_ids";
const DEPARTMENTS_EXPANDED_DATE_KEY = "departments_expanded_date";

// 获取今天的日期字符串 (YYYY-MM-DD)
function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 树节点类型
type TreeNode = DepartmentWithParent & {
  children: TreeNode[];
};

// 扁平化节点（用于渲染）
type FlatNode = {
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
};

// 构建树形结构
function buildTree(departments: DepartmentWithParent[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // 首先创建所有节点
  departments.forEach((dept) => {
    nodeMap.set(dept.id, { ...dept, children: [] });
  });

  // 然后建立父子关系
  departments.forEach((dept) => {
    const node = nodeMap.get(dept.id)!;
    if (dept.parent_id && nodeMap.has(dept.parent_id)) {
      const parent = nodeMap.get(dept.parent_id)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // 对每个层级的子节点按 code 排序
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.code ?? '').localeCompare(b.code ?? ''));
    nodes.forEach((node) => sortChildren(node.children));
  };
  sortChildren(roots);

  return roots;
}

// 扁平化树（只展开已展开的节点）
function flattenTree(
  nodes: TreeNode[],
  expandedIds: Set<string>,
  depth: number = 0
): FlatNode[] {
  const result: FlatNode[] = [];

  nodes.forEach((node) => {
    const hasChildren = node.children.length > 0;
    result.push({ node, depth, hasChildren });

    if (hasChildren && expandedIds.has(node.id)) {
      result.push(...flattenTree(node.children, expandedIds, depth + 1));
    }
  });

  return result;
}

// 获取所有节点 ID
function getAllNodeIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  const traverse = (nodeList: TreeNode[]) => {
    nodeList.forEach((node) => {
      ids.push(node.id);
      traverse(node.children);
    });
  };
  traverse(nodes);
  return ids;
}

// 获取所有有子节点的节点 ID
function getParentNodeIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  const traverse = (nodeList: TreeNode[]) => {
    nodeList.forEach((node) => {
      if (node.children.length > 0) {
        ids.push(node.id);
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return ids;
}

// 搜索过滤并返回匹配的节点及其祖先
function filterNodes(
  nodes: TreeNode[],
  searchTerm: string
): { filteredNodes: TreeNode[]; matchedIds: Set<string>; ancestorIds: Set<string> } {
  const matchedIds = new Set<string>();
  const ancestorIds = new Set<string>();
  const lowerSearch = searchTerm.toLowerCase();

  // 检查节点是否匹配
  const isMatch = (node: TreeNode): boolean => {
    return (
      node.name.toLowerCase().includes(lowerSearch) ||
      (node.code ?? '').toLowerCase().includes(lowerSearch) ||
      (node.manager_name ?? '').toLowerCase().includes(lowerSearch) ||
      (node.city ?? '').toLowerCase().includes(lowerSearch)
    );
  };

  // 递归过滤并标记祖先
  const filterRecursive = (nodeList: TreeNode[], ancestors: string[]): TreeNode[] => {
    return nodeList
      .map((node) => {
        const filteredChildren = filterRecursive(node.children, [...ancestors, node.id]);
        const nodeMatches = isMatch(node);
        const hasMatchingChildren = filteredChildren.length > 0;

        if (nodeMatches || hasMatchingChildren) {
          if (nodeMatches) {
            matchedIds.add(node.id);
            ancestors.forEach((id) => ancestorIds.add(id));
          }
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter((node): node is TreeNode => node !== null);
  };

  const filteredNodes = filterRecursive(nodes, []);
  return { filteredNodes, matchedIds, ancestorIds };
}

// 高亮搜索词
function highlightText(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm) return text;
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerSearch);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {text.slice(index, index + searchTerm.length)}
      </mark>
      {text.slice(index + searchTerm.length)}
    </>
  );
}

// 区分类型对应的颜色
function getCategoryColor(category: string | null): string {
  switch (category) {
    case '本部':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case '支局':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case '教室':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case '部署':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

export function DepartmentsTreeClient({
  departments,
}: {
  departments: DepartmentWithParent[];
}) {
  const router = useRouter();
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [updatingProxyBilling, setUpdatingProxyBilling] = React.useState<string | null>(null);
  const [detailDepartment, setDetailDepartment] = React.useState<DepartmentWithParent | null>(null);

  // 更新代行請求设置
  const handleToggleProxyBilling = async (id: string, currentValue: boolean) => {
    if (updatingProxyBilling) return;
    setUpdatingProxyBilling(id);
    try {
      const response = await fetch("/api/internal/departments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, allow_proxy_billing: !currentValue }),
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        const message = data.error || "更新に失敗しました";
        alert(message);
        return;
      }
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新に失敗しました";
      alert(message);
    } finally {
      setUpdatingProxyBilling(null);
    }
  };

  // 构建树形结构
  const tree = React.useMemo(() => buildTree(departments), [departments]);

  // 获取默认展开的节点（リトミック研究センター）
  const defaultExpandedIds = React.useMemo(() => {
    // 找到 code 为 "1000000" 的节点（リトミック研究センター）
    const rootNode = departments.find((d) => d.code === "1000000");
    return rootNode ? new Set([rootNode.id]) : new Set<string>();
  }, [departments]);

  // 从 localStorage 恢复展开状态（每天0点重置）
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const savedDate = window.localStorage.getItem(DEPARTMENTS_EXPANDED_DATE_KEY);
      const today = getTodayDateString();
      
      // 如果保存的日期不是今天，重置为默认展开状态
      if (savedDate !== today) {
        window.localStorage.removeItem(DEPARTMENTS_EXPANDED_STORAGE_KEY);
        window.localStorage.setItem(DEPARTMENTS_EXPANDED_DATE_KEY, today);
        // 设置默认展开的节点
        setExpandedIds(defaultExpandedIds);
        setIsInitialized(true);
        return;
      }
      
      // 恢复展开状态
      const raw = window.localStorage.getItem(DEPARTMENTS_EXPANDED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const safe = parsed
            .map((value) => (typeof value === "string" ? value.trim() : ""))
            .filter((value) => value.length > 0);
          setExpandedIds(new Set(safe));
        }
      } else {
        // 如果没有保存的状态，使用默认展开
        setExpandedIds(defaultExpandedIds);
      }
    } catch {
      // ignore
    }
    setIsInitialized(true);
  }, [defaultExpandedIds]);

  // 保存展开状态到 localStorage
  React.useEffect(() => {
    if (typeof window === "undefined" || !isInitialized) return;
    
    const today = getTodayDateString();
    window.localStorage.setItem(DEPARTMENTS_EXPANDED_DATE_KEY, today);
    
    if (expandedIds.size === 0) {
      window.localStorage.removeItem(DEPARTMENTS_EXPANDED_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(DEPARTMENTS_EXPANDED_STORAGE_KEY, JSON.stringify(Array.from(expandedIds)));
  }, [expandedIds, isInitialized]);

  // 过滤和搜索
  const { displayNodes, matchedIds, ancestorIds } = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return { displayNodes: tree, matchedIds: new Set<string>(), ancestorIds: new Set<string>() };
    }
    const { filteredNodes, matchedIds, ancestorIds } = filterNodes(tree, searchTerm.trim());
    return { displayNodes: filteredNodes, matchedIds, ancestorIds };
  }, [tree, searchTerm]);

  // 搜索时自动展开匹配节点的祖先
  React.useEffect(() => {
    if (searchTerm.trim() && ancestorIds.size > 0) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestorIds.forEach((id) => next.add(id));
        // 也展开匹配的节点本身（如果有子节点）
        matchedIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [searchTerm, ancestorIds, matchedIds]);

  // 扁平化用于渲染
  const flatNodes = React.useMemo(
    () => flattenTree(displayNodes, expandedIds),
    [displayNodes, expandedIds]
  );

  // 从 sessionStorage 恢复选择状态
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(DEPARTMENTS_SELECTION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const safe = parsed
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0);
        setSelectedIds(safe);
      }
    } catch {
      // ignore
    }
  }, []);

  // 保存选择状态到 sessionStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedIds.length) {
      window.sessionStorage.removeItem(DEPARTMENTS_SELECTION_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(DEPARTMENTS_SELECTION_STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  // 切换节点展开状态
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 展开所有
  const expandAll = () => {
    const allParentIds = getParentNodeIds(tree);
    setExpandedIds(new Set(allParentIds));
  };

  // 折叠所有
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // 全选/取消全选
  const allIds = React.useMemo(() => getAllNodeIds(tree), [tree]);
  const visibleIds = React.useMemo(() => flatNodes.map((fn) => fn.node.id), [flatNodes]);
  
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.length > 0 && visibleIds.some((id) => selectedIds.includes(id));
  
  const headerCheckboxChecked: boolean | "indeterminate" = allVisibleSelected
    ? true
    : someVisibleSelected
      ? "indeterminate"
      : false;

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectedIds);
      visibleIds.forEach((id) => next.add(id));
      setSelectedIds(Array.from(next));
    } else {
      const remove = new Set(visibleIds);
      setSelectedIds((prev) => prev.filter((id) => !remove.has(id)));
    }
  };

  // 导出功能
  const handleExport = async (mode: "all" | "selected") => {
    if (isExporting) return;
    if (mode === "selected" && !selectedIds.length) return;
    setIsExporting(true);
    try {
      const body = mode === "selected" ? { ids: selectedIds } : {};
      const response = await fetch("/api/internal/departments/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; rowCount?: number }
        | null;
      if (!response.ok || !data?.ok) {
        const message = data?.error || `エクスポートに失敗しました (status ${response.status})`;
        alert(message);
        return;
      }
      const rowCount = typeof data.rowCount === "number" ? data.rowCount : 0;
      alert(`エクスポートが完了しました（${rowCount} 件）`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "エクスポートに失敗しました";
      alert(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = (mode: "all" | "selected") => {
    if (mode === "selected" && !selectedIds.length) return;
    const base = "/api/internal/departments/export-csv";
    const url = mode === "selected" && selectedIds.length
      ? `${base}?ids=${encodeURIComponent(selectedIds.join(","))}`
      : base;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`選択中の部署（${selectedIds.length}件）を削除しますか？`);
      if (!confirmed) return;
    }
    try {
      for (const id of selectedIds) {
        const response = await fetch(`/api/internal/departments?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          const message = data?.error || `削除に失敗しました (status ${response.status})`;
          if (typeof window !== "undefined") {
            window.alert(message);
          }
          return;
        }
      }
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "一括削除に失敗しました";
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  };

  return (
    <Card className="rounded-xl border bg-card shadow-sm">
      <CardContent className="p-0">
        {/* ヘッダー */}
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                aria-label="全て選択"
                checked={headerCheckboxChecked}
                onCheckedChange={(checked) => handleToggleSelectAll(checked === true)}
              />
              <span className="text-muted-foreground">
                {selectedIds.length > 0 ? `${selectedIds.length} 件選択中` : '全て選択'}
              </span>
            </label>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
            {/* 検索 */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="店番・部署名・責任者・地域で検索"
                className="pl-9"
              />
            </div>

            {/* 展開/折りたたみボタン */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="gap-1"
              >
                <ChevronsUpDown className="h-4 w-4" />
                すべて展開
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="gap-1"
              >
                <ChevronsDownUp className="h-4 w-4" />
                すべて折りたたむ
              </Button>
            </div>

            {/* エクスポート */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary hover:bg-primary/10"
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />
                  エクスポート
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>CSV でエクスポート</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExportCsv("all")}>
                      全てのデータをエクスポート
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!selectedIds.length}
                      onClick={() => handleExportCsv("selected")}
                    >
                      選択中のデータをエクスポート
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {isExporting ? "Google Sheets にエクスポート中..." : "Google Sheets にエクスポート"}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport("all")} disabled={isExporting}>
                      全てのデータをエクスポート
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!selectedIds.length || isExporting}
                      onClick={() => handleExport("selected")}
                    >
                      選択中のデータをエクスポート
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ツリーリスト */}
        <div className="divide-y divide-border">
          {flatNodes.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {searchTerm ? '検索結果がありません' : '部署データがありません'}
            </div>
          ) : (
            flatNodes.map(({ node, depth, hasChildren }) => {
              const isExpanded = expandedIds.has(node.id);
              const isSelected = selectedIds.includes(node.id);
              const isMatched = matchedIds.has(node.id);

              return (
                <div
                  key={node.id}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors",
                    isMatched && searchTerm && "bg-yellow-50 dark:bg-yellow-900/20"
                  )}
                  style={{ paddingLeft: `${24 + depth * 24}px` }}
                >
                  {/* 展開/折りたたみボタン */}
                  <button
                    type="button"
                    onClick={() => hasChildren && toggleExpand(node.id)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded hover:bg-muted",
                      !hasChildren && "invisible"
                    )}
                  >
                    {hasChildren && (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )
                    )}
                  </button>

                  {/* チェックボックス */}
                  <Checkbox
                    aria-label={`${node.name} を選択`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      setSelectedIds((prev) => {
                        if (checked === true) {
                          if (prev.includes(node.id)) return prev;
                          return [...prev, node.id];
                        }
                        return prev.filter((id) => id !== node.id);
                      });
                    }}
                  />

                  {/* アイコン */}
                  <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />

                  {/* 部署情報 */}
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {highlightText(node.name, searchTerm)}
                        </span>
                        {node.category && (
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs flex-shrink-0", getCategoryColor(node.category))}
                          >
                            {node.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {node.code && (
                          <span className="font-mono">
                            {highlightText(node.code, searchTerm)}
                          </span>
                        )}
                        {node.manager_name && (
                          <span>
                            {highlightText(node.manager_name, searchTerm)}
                          </span>
                        )}
                        {(node.prefecture || node.city) && (
                          <span className="truncate">
                            {highlightText([node.prefecture, node.city].filter(Boolean).join(' '), searchTerm)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 子部署数 */}
                    {hasChildren && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {node.children.length} 件
                      </span>
                    )}
                  </div>

                  {/* 代行請求 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">代行</span>
                    <Switch
                      checked={node.allow_proxy_billing ?? false}
                      disabled={updatingProxyBilling === node.id}
                      onCheckedChange={() => handleToggleProxyBilling(node.id, node.allow_proxy_billing ?? false)}
                      className="scale-75"
                    />
                  </div>

                  {/* 操作ボタン */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 text-primary hover:bg-primary/10"
                    onClick={() => {
                      const dept = departments.find((d) => d.id === node.id);
                      if (dept) setDetailDepartment(dept);
                    }}
                  >
                    詳細
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs text-destructive border-destructive/40"
            disabled={!selectedIds.length}
            onClick={handleBulkDelete}
          >
            一括削除
          </Button>
          <p className="text-xs text-muted-foreground">
            全 {departments.length} 件
            {searchTerm && ` (${flatNodes.length} 件表示中)`}
          </p>
        </div>
      </CardContent>

      {/* 部署詳細 Sheet */}
      <Sheet open={!!detailDepartment} onOpenChange={(open) => !open && setDetailDepartment(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              部署詳細
            </SheetTitle>
          </SheetHeader>
          {detailDepartment && (
            <div className="mt-6 space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">基本情報</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <Label className="w-24 text-xs text-muted-foreground pt-0.5">部署名</Label>
                    <span className="text-sm font-medium">{detailDepartment.name}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Label className="w-24 text-xs text-muted-foreground pt-0.5">店番</Label>
                    <span className="text-sm font-mono">{detailDepartment.code}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Label className="w-24 text-xs text-muted-foreground pt-0.5">種別</Label>
                    <Badge variant="outline" className="text-xs">
                      {detailDepartment.type}
                    </Badge>
                  </div>
                  {detailDepartment.parent_name && (
                    <div className="flex items-start gap-3">
                      <Label className="w-24 text-xs text-muted-foreground pt-0.5">上位部署</Label>
                      <span className="text-sm">{detailDepartment.parent_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 責任者情報 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">責任者情報</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs text-muted-foreground">責任者名</Label>
                      <p className="text-sm">{detailDepartment.manager_name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs text-muted-foreground">電話番号</Label>
                      <p className="text-sm">{detailDepartment.phone_primary || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 所在地情報 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">所在地</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs text-muted-foreground">住所</Label>
                      <p className="text-sm">
                        {detailDepartment.postal_code && `〒${detailDepartment.postal_code} `}
                        {detailDepartment.prefecture || ""}
                        {detailDepartment.city || ""}
                        {detailDepartment.address_line1 || ""}
                        {detailDepartment.address_line2 || ""}
                        {!detailDepartment.prefecture && !detailDepartment.city && !detailDepartment.address_line1 && "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 設定 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">設定</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">代行請求</Label>
                    </div>
                    <Badge variant={detailDepartment.allow_proxy_billing ? "default" : "secondary"}>
                      {detailDepartment.allow_proxy_billing ? "有効" : "無効"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
