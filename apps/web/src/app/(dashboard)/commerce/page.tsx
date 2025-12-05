import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { listProducts, listProductCategories } from "@enterprise/db";
import { CommerceClient } from "./commerce-client";

type CommerceSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  order?: string;
};

type CommercePageProps = {
  searchParams?: Promise<CommerceSearchParams>;
};

export default async function CommerceListPage({
  searchParams,
}: CommercePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = Number(resolvedSearchParams?.page);
  const limitParam = Number(resolvedSearchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 100) : 20;
  const search = resolvedSearchParams?.q?.trim();
  const category_id = resolvedSearchParams?.category?.trim();
  const status = resolvedSearchParams?.status?.trim();
  const is_active = status === "active" ? true : status === "inactive" ? false : undefined;
  const sortKey = resolvedSearchParams?.sort?.trim();
  const sortOrder = resolvedSearchParams?.order === "desc" ? "desc" : resolvedSearchParams?.order === "asc" ? "asc" : undefined;
  const offset = (page - 1) * limit;

  const [productsResult, categoriesResult, allProductsResult] = await Promise.all([
    listProducts({ limit, offset, search, category_id, is_active, sortKey, sortOrder }).catch((error) => {
      console.error("Failed to load products from Supabase on commerce page", error);
      return { products: [], count: 0 };
    }),
    listProductCategories({ limit: 1000 }).catch((error) => {
      console.error("Failed to load product categories from Supabase on commerce page", error);
      return { items: [], count: 0 };
    }),
    // 获取所有商品用于统计
    listProducts({ limit: 10000 }).catch((error) => {
      console.error("Failed to load all products for stats", error);
      return { products: [], count: 0 };
    }),
  ]);

  // 计算统计数据
  const allProducts = allProductsResult.products;
  const stats = {
    totalProducts: allProductsResult.count,
    activeProducts: allProducts.filter((p) => p.is_active).length,
    lowStockProducts: allProducts.filter((p) => p.stock <= (p.stock_alert_threshold ?? 10)).length,
    totalStockValue: allProducts.reduce((sum, p) => sum + (p.stock * p.price_retail), 0),
  };

  const pagination = {
    page,
    limit,
    count: productsResult.count,
    search: search ?? "",
    category: category_id ?? "",
    status: status ?? "",
    sortKey: sortKey ?? null,
    sortOrder: sortOrder ?? null,
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="商品管理" />
      <Suspense fallback={null}>
        <CommerceClient
          products={productsResult.products}
          categories={categoriesResult.items}
          pagination={pagination}
          stats={stats}
        />
      </Suspense>
    </div>
  );
}
