"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  defaultValue?: string;
  category?: string;
};

/**
 * Live search input for products page.
 * Debounces input and pushes query params without requiring submit.
 */
export function SearchBar({ defaultValue, category }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      params.delete("page");

      startTransition(() => {
        router.push(`/products?${params.toString()}`);
      });
    }, 250);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, category, router, searchParams]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        name="q"
        placeholder="商品名・商品コードで検索..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 pr-10"
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        value && (
          <button
            type="button"
            aria-label="検索クリア"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => setValue("")}
          >
            <X className="h-4 w-4" />
          </button>
        )
      )}
    </div>
  );
}
