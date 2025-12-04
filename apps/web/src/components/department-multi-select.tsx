"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type Department = {
  id: string;
  name: string;
  type: string;
  level: number;
};

type DepartmentMultiSelectProps = {
  departments: Department[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DepartmentMultiSelect({
  departments,
  selectedIds,
  onSelectionChange,
  placeholder = "部署を選択...",
  disabled = false,
}: DepartmentMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedDepartments = React.useMemo(() => {
    return departments.filter((dept) => selectedIds.includes(dept.id));
  }, [departments, selectedIds]);

  const filteredDepartments = React.useMemo(() => {
    if (!searchValue) return departments;
    const lowerSearch = searchValue.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(lowerSearch) ||
        dept.type.toLowerCase().includes(lowerSearch)
    );
  }, [departments, searchValue]);

  const handleSelect = (departmentId: string) => {
    if (selectedIds.includes(departmentId)) {
      onSelectionChange(selectedIds.filter((id) => id !== departmentId));
    } else {
      onSelectionChange([...selectedIds, departmentId]);
    }
  };

  const handleRemove = (departmentId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== departmentId));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate text-muted-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} 件選択中`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="部署名で検索..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>部署が見つかりません</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredDepartments.map((dept) => {
                  const isSelected = selectedIds.includes(dept.id);
                  return (
                    <CommandItem
                      key={dept.id}
                      value={dept.id}
                      onSelect={() => handleSelect(dept.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="truncate">{dept.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {dept.type}
                        </Badge>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedDepartments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              選択された部署 ({selectedDepartments.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              すべてクリア
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-muted/30 p-2">
            {selectedDepartments.map((dept) => (
              <Badge
                key={dept.id}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <span className="max-w-[150px] truncate text-xs">
                  {dept.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(dept.id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">削除</span>
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
