"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  paramName?: string;
  debounceMs?: number;
  minChars?: number;
  className?: string;
}

export function SearchInput({
  placeholder = "検索...",
  paramName = "q",
  debounceMs = 500,
  minChars = 1,
  className,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialValue = searchParams.get(paramName) ?? "";
  const [value, setValue] = React.useState(initialValue);
  const [isPending, setIsPending] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = React.useRef(initialValue);

  // Sync with URL when it changes externally
  React.useEffect(() => {
    const urlValue = searchParams.get(paramName) ?? "";
    if (urlValue !== lastSearchRef.current) {
      setValue(urlValue);
      lastSearchRef.current = urlValue;
      setIsPending(false);
    }
  }, [searchParams, paramName]);

  const updateSearch = React.useCallback(
    (searchValue: string) => {
      const trimmed = searchValue.trim();
      
      // Skip if same as last search
      if (trimmed === lastSearchRef.current) {
        setIsPending(false);
        return;
      }
      
      lastSearchRef.current = trimmed;
      
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set(paramName, trimmed);
      } else {
        params.delete(paramName);
      }
      // Reset to page 1 when searching
      params.delete("page");
      
      // Use replace instead of push to avoid history pollution
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setIsPending(false);
    },
    [pathname, router, searchParams, paramName]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const trimmed = newValue.trim();
    
    // Don't search if below minimum characters (unless clearing)
    if (trimmed.length > 0 && trimmed.length < minChars) {
      setIsPending(false);
      return;
    }

    setIsPending(true);

    // Debounce the search
    timeoutRef.current = setTimeout(() => {
      updateSearch(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setValue("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Force update by setting lastSearchRef to a non-empty value first
    const currentSearch = lastSearchRef.current;
    if (currentSearch) {
      lastSearchRef.current = ""; // Reset ref
      // Directly update URL to clear search
      const params = new URLSearchParams(searchParams.toString());
      params.delete(paramName);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Immediate search on Enter
    if (e.key === "Enter") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      updateSearch(value);
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search className={cn(
        "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
        isPending ? "text-primary animate-pulse" : "text-muted-foreground"
      )} />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
