"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronRight, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DepartmentNode = {
  id: string;
  name: string;
  type: string;
  level: number;
  parent_id: string | null;
  parent_name: string | null;
};

type TreeNode = DepartmentNode & {
  children: TreeNode[];
};

type DepartmentTreeSelectProps = {
  departments: DepartmentNode[];
  value: string;
  onValueChange: (value: string, id: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

// 构建树形结构
function buildTree(departments: DepartmentNode[]): TreeNode[] {
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

  // 按名称排序
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => a.name.localeCompare(b.name, "ja"))
      .map((node) => ({
        ...node,
        children: sortNodes(node.children),
      }));
  };

  return sortNodes(roots);
}

// 扁平化树结构用于渲染，同时保留层级信息
type FlatNode = {
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
};

function flattenTree(
  nodes: TreeNode[],
  expandedIds: Set<string>,
  depth = 0
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

// 搜索时展开所有匹配的节点路径
function getExpandedIdsForSearch(
  departments: DepartmentNode[],
  searchTerm: string
): Set<string> {
  if (!searchTerm) return new Set();

  const lowerSearch = searchTerm.toLowerCase();
  const matchingIds = new Set<string>();
  const parentIds = new Set<string>();

  // 找到所有匹配的节点
  departments.forEach((dept) => {
    if (
      dept.name.toLowerCase().includes(lowerSearch) ||
      dept.type.toLowerCase().includes(lowerSearch)
    ) {
      matchingIds.add(dept.id);
    }
  });

  // 找到所有匹配节点的父节点
  const findParents = (id: string) => {
    const dept = departments.find((d) => d.id === id);
    if (dept?.parent_id) {
      parentIds.add(dept.parent_id);
      findParents(dept.parent_id);
    }
  };

  matchingIds.forEach((id) => findParents(id));

  return new Set([...matchingIds, ...parentIds]);
}

// 过滤匹配搜索的节点
function filterNodes(nodes: TreeNode[], searchTerm: string): TreeNode[] {
  if (!searchTerm) return nodes;

  const lowerSearch = searchTerm.toLowerCase();

  const filterRecursive = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .map((node) => {
        const matchesSelf =
          node.name.toLowerCase().includes(lowerSearch) ||
          node.type.toLowerCase().includes(lowerSearch);
        const filteredChildren = filterRecursive(node.children);

        if (matchesSelf || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter((node): node is TreeNode => node !== null);
  };

  return filterRecursive(nodes);
}

// 树节点组件
function TreeItem({
  flatNode,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  searchTerm,
}: {
  flatNode: FlatNode;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  searchTerm: string;
}) {
  const { node, depth, hasChildren } = flatNode;

  // 高亮搜索词
  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const lowerText = text.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerSearch);

    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <span className="bg-yellow-200 dark:bg-yellow-800">
          {text.slice(index, index + searchTerm.length)}
        </span>
        {text.slice(index + searchTerm.length)}
      </>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
        isSelected && "bg-accent"
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={onSelect}
    >
      {hasChildren ? (
        <button
          type="button"
          className="p-0.5 hover:bg-muted rounded"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      ) : (
        <span className="w-5" />
      )}

      <Check
        className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
      />

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className="truncate">{highlightText(node.name)}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          {node.type}
        </span>
      </div>
    </div>
  );
}

export function DepartmentTreeSelect({
  departments,
  value,
  onValueChange,
  placeholder = "部署を選択",
  disabled = false,
}: DepartmentTreeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  // 构建树
  const tree = React.useMemo(() => buildTree(departments), [departments]);

  // 搜索时自动展开匹配的节点
  const searchExpandedIds = React.useMemo(
    () => getExpandedIdsForSearch(departments, searchTerm),
    [departments, searchTerm]
  );

  // 过滤后的树
  const filteredTree = React.useMemo(
    () => filterNodes(tree, searchTerm),
    [tree, searchTerm]
  );

  // 合并手动展开和搜索展开的节点
  const effectiveExpandedIds = React.useMemo(() => {
    if (searchTerm) {
      return searchExpandedIds;
    }
    return expandedIds;
  }, [searchTerm, searchExpandedIds, expandedIds]);

  // 扁平化用于渲染
  const flatNodes = React.useMemo(
    () => flattenTree(filteredTree, effectiveExpandedIds),
    [filteredTree, effectiveExpandedIds]
  );

  // 获取选中的部门名称
  const selectedDepartment = React.useMemo(
    () => departments.find((d) => d.name === value),
    [departments, value]
  );

  const handleToggle = (id: string) => {
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

  const handleSelect = (name: string, id: string) => {
    onValueChange(name, id);
    setOpen(false);
    setSearchTerm("");
  };

  // 展开所有
  const handleExpandAll = () => {
    const allIds = new Set(departments.map((d) => d.id));
    setExpandedIds(allIds);
  };

  // 折叠所有
  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex flex-col">
          {/* 搜索框 */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="部署名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* 展开/折叠按钮 */}
          <div className="flex items-center justify-between border-b px-3 py-1.5">
            <span className="text-xs text-muted-foreground">
              {flatNodes.length} 件表示中
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleExpandAll}
              >
                すべて展開
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleCollapseAll}
              >
                すべて折りたたむ
              </Button>
            </div>
          </div>

          {/* 未設定选项 */}
          <div
            className={cn(
              "flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent border-b",
              !value && "bg-accent"
            )}
            onClick={() => handleSelect("", "")}
          >
            <span className="w-5" />
            <Check className={cn("h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
            <span className="text-muted-foreground">未設定</span>
          </div>

          {/* 树形列表 - 使用原生滚动以支持触控板 */}
          <div 
            className="p-1"
            style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
            onWheel={(e) => {
              // 阻止事件冒泡，确保滚动事件被正确处理
              e.stopPropagation();
            }}
          >
            {flatNodes.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                部署が見つかりません
              </div>
            ) : (
              flatNodes.map((flatNode) => (
                <TreeItem
                  key={flatNode.node.id}
                  flatNode={flatNode}
                  isSelected={value === flatNode.node.name}
                  isExpanded={effectiveExpandedIds.has(flatNode.node.id)}
                  onSelect={() => handleSelect(flatNode.node.name, flatNode.node.id)}
                  onToggle={() => handleToggle(flatNode.node.id)}
                  searchTerm={searchTerm}
                />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
