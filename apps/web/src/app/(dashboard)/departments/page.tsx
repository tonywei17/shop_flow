import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { getDepartmentsWithScope } from "@/lib/services/org";
import { DepartmentsTreeClient } from "./departments-tree-client";

export default async function DepartmentsPage() {
  // 获取部署数据（自动应用当前用户的数据权限过滤）
  const { departments } = await getDepartmentsWithScope({}).catch((error) => {
    console.error("Failed to load departments from Supabase on departments page", error);
    return { departments: [], count: 0 };
  });

  return (
    <div className="space-y-6">
      <DashboardHeader title="部署管理" />
      <Suspense fallback={null}>
        <DepartmentsTreeClient departments={departments} />
      </Suspense>
    </div>
  );
}
