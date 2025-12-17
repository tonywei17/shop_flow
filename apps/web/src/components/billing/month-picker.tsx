"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MonthPickerProps = {
  value: string; // YYYY-MM format
  onChange: (value: string) => void;
  minYear?: number;
  maxYear?: number;
};

const MONTHS = [
  { value: "01", label: "1月" },
  { value: "02", label: "2月" },
  { value: "03", label: "3月" },
  { value: "04", label: "4月" },
  { value: "05", label: "5月" },
  { value: "06", label: "6月" },
  { value: "07", label: "7月" },
  { value: "08", label: "8月" },
  { value: "09", label: "9月" },
  { value: "10", label: "10月" },
  { value: "11", label: "11月" },
  { value: "12", label: "12月" },
];

export function MonthPicker({ value, onChange, minYear = 2020, maxYear }: MonthPickerProps) {
  const currentYear = new Date().getFullYear();
  const effectiveMaxYear = maxYear || currentYear + 1;
  
  const [year, month] = value.split("-");
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);

  const years = React.useMemo(() => {
    const result = [];
    for (let y = effectiveMaxYear; y >= minYear; y--) {
      result.push(y);
    }
    return result;
  }, [minYear, effectiveMaxYear]);

  const handleYearChange = (newYear: string) => {
    onChange(`${newYear}-${month}`);
  };

  const handleMonthChange = (newMonth: string) => {
    onChange(`${year}-${newMonth}`);
  };

  const handlePrevMonth = () => {
    let newYear = yearNum;
    let newMonth = monthNum - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    if (newYear >= minYear) {
      onChange(`${newYear}-${String(newMonth).padStart(2, "0")}`);
    }
  };

  const handleNextMonth = () => {
    let newYear = yearNum;
    let newMonth = monthNum + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    if (newYear <= effectiveMaxYear) {
      onChange(`${newYear}-${String(newMonth).padStart(2, "0")}`);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    onChange(currentMonth);
  };

  const canGoPrev = yearNum > minYear || monthNum > 1;
  const canGoNext = yearNum < effectiveMaxYear || monthNum < 12;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          <Select value={year} onValueChange={handleYearChange}>
            <SelectTrigger className="h-8 w-[90px] border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-8 w-[80px] border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNextMonth}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1"
        onClick={handleCurrentMonth}
      >
        <Calendar className="h-3.5 w-3.5" />
        今月
      </Button>
    </div>
  );
}

// Helper function to get current month in YYYY-MM format
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Helper function to format month for display
export function formatMonthDisplay(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  return `${year}年${parseInt(month, 10)}月`;
}
