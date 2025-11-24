# Learning平台功能接入实施指南

## 📋 概述

本指南提供了将Mock数据替换为真实API的详细步骤，帮助团队快速、安全地接入后端功能。

---

## 🎯 实施原则

1. **渐进式迁移**：一次迁移一个功能模块
2. **向后兼容**：保持现有UI不变
3. **错误优先**：先实现错误处理
4. **测试驱动**：每个功能都要测试
5. **文档同步**：及时更新文档

---

## 📦 前置准备

### 1. 安装必要依赖

```bash
cd apps/learning

# 数据获取和缓存
pnpm add @tanstack/react-query @tanstack/react-query-devtools

# 表单和验证
pnpm add zod react-hook-form @hookform/resolvers

# 日期处理
pnpm add date-fns

# 开发依赖
pnpm add -D @types/node
```

### 2. 配置环境变量

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑.env.local，填入真实值
```

### 3. 更新package.json类型引用

```json
{
  "dependencies": {
    "@enterprise/types": "workspace:*"
  }
}
```

---

## 🔄 迁移步骤

### 阶段1：课程功能（第1-2周）

#### Step 1.1: 创建API服务

```typescript
// apps/learning/src/lib/api/courses.ts
import { apiClient } from './client';
import type { Course, PaginatedResponse, CourseFilters } from '@enterprise/types';

export const coursesApi = {
  // 获取课程列表
  getAll: async (filters?: CourseFilters) => {
    return apiClient.get<PaginatedResponse<Course>>('/courses', {
      params: filters as any,
    });
  },

  // 获取单个课程
  getById: async (id: string) => {
    return apiClient.get<Course>(`/courses/${id}`);
  },

  // 获取课程视频
  getVideos: async (courseId: string) => {
    return apiClient.get<Video[]>(`/courses/${courseId}/videos`);
  },
};
```

#### Step 1.2: 创建React Query Hooks

```typescript
// apps/learning/src/hooks/use-courses.ts
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import type { CourseFilters } from '@enterprise/types';

export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}
```

#### Step 1.3: 更新页面组件

```typescript
// apps/learning/src/app/courses/page.tsx
'use client';

import { useCourses } from '@/hooks/use-courses';
import { LoadingSpinner } from '@/components/loading';
import { ErrorMessage } from '@/components/error-message';

export default function CoursesPage() {
  const { data, isLoading, error } = useCourses();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  const courses = data.data;

  return (
    <div>
      {/* 现有UI代码，只需替换数据源 */}
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

#### Step 1.4: 测试

```typescript
// apps/learning/src/hooks/use-courses.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCourses } from './use-courses';

describe('useCourses', () => {
  it('should fetch courses', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useCourses(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

---

### 阶段2：活动功能（第3周）

#### Step 2.1: 创建API服务

```typescript
// apps/learning/src/lib/api/activities.ts
import { apiClient } from './client';
import type { Activity, ActivityFilters } from '@enterprise/types';

export const activitiesApi = {
  getAll: async (filters?: ActivityFilters) => {
    return apiClient.get<Activity[]>('/activities', {
      params: filters as any,
    });
  },

  getById: async (id: string) => {
    return apiClient.get<Activity>(`/activities/${id}`);
  },

  register: async (activityId: string) => {
    return apiClient.post(`/activities/${activityId}/register`);
  },

  cancel: async (activityId: string) => {
    return apiClient.post(`/activities/${activityId}/cancel`);
  },
};
```

#### Step 2.2: 创建Hooks

```typescript
// apps/learning/src/hooks/use-activities.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api/activities';

export function useActivities(filters?) {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activitiesApi.getAll(filters),
  });
}

export function useActivityRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activitiesApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      // 显示成功提示
    },
    onError: (error) => {
      // 显示错误提示
    },
  });
}
```

---

### 阶段3：通知功能（第4周）

#### Step 3.1: 创建API服务

```typescript
// apps/learning/src/lib/api/notifications.ts
import { apiClient } from './client';
import type { Notification } from '@enterprise/types';

export const notificationsApi = {
  getAll: async (filter?: 'all' | 'unread') => {
    return apiClient.get<Notification[]>('/notifications', {
      params: { filter },
    });
  },

  markAsRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.post('/notifications/read-all');
  },

  delete: async (id: string) => {
    return apiClient.delete(`/notifications/${id}`);
  },

  getUnreadCount: async () => {
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },
};
```

#### Step 3.2: 实时更新（WebSocket）

```typescript
// apps/learning/src/lib/websocket.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useNotificationWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_notification') {
        // 更新通知列表
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        // 更新未读数
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      }
    };

    return () => ws.close();
  }, [queryClient]);
}
```

---

### 阶段4：用户认证（第5周）

#### Step 4.1: 创建认证Context

```typescript
// apps/learning/src/contexts/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { Member } from '@enterprise/types';

interface AuthContextType {
  user: Member | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查用户会话
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### Step 4.2: 创建认证中间件

```typescript
// apps/learning/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/courses/*/learn', '/notifications'];
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 检查是否是受保护的路由
  const isProtected = protectedRoutes.some(route => {
    const regex = new RegExp(`^${route.replace('*', '.*')}$`);
    return regex.test(pathname);
  });

  // 未登录访问受保护路由
  if (isProtected && !token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 已登录访问登录页
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 🔧 B端管理系统迁移

### 活动管理

```typescript
// apps/web/src/lib/api/activities.ts
import { apiClient } from './client';
import type { Activity, CreateActivityInput } from '@enterprise/types';

export const activitiesAdminApi = {
  getAll: async () => {
    return apiClient.get<Activity[]>('/admin/activities');
  },

  create: async (data: CreateActivityInput) => {
    return apiClient.post<Activity>('/admin/activities', data);
  },

  update: async (id: string, data: Partial<Activity>) => {
    return apiClient.patch<Activity>(`/admin/activities/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/admin/activities/${id}`);
  },

  publish: async (id: string) => {
    return apiClient.post(`/admin/activities/${id}/publish`);
  },
};
```

### 通知管理

```typescript
// apps/web/src/lib/api/notifications.ts
import { apiClient } from './client';
import type { Notification, CreateNotificationInput } from '@enterprise/types';

export const notificationsAdminApi = {
  getAll: async () => {
    return apiClient.get<Notification[]>('/admin/notifications');
  },

  create: async (data: CreateNotificationInput) => {
    return apiClient.post<Notification>('/admin/notifications', data);
  },

  send: async (id: string) => {
    return apiClient.post(`/admin/notifications/${id}/send`);
  },

  getStats: async (id: string) => {
    return apiClient.get(`/admin/notifications/${id}/stats`);
  },
};
```

---

## 🧪 测试策略

### 单元测试

```typescript
// apps/learning/src/lib/api/courses.test.ts
import { describe, it, expect, vi } from 'vitest';
import { coursesApi } from './courses';

// Mock fetch
global.fetch = vi.fn();

describe('coursesApi', () => {
  it('should fetch courses', async () => {
    const mockCourses = [{ id: '1', title: 'Test Course' }];
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCourses }),
    });

    const result = await coursesApi.getAll();
    expect(result.data).toEqual(mockCourses);
  });
});
```

### 集成测试

```typescript
// apps/learning/tests/integration/courses.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CoursesPage from '@/app/courses/page';

describe('CoursesPage Integration', () => {
  it('should display courses', async () => {
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <CoursesPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('リトミック基礎コース')).toBeInTheDocument();
    });
  });
});
```

---

## 📊 监控和日志

### 错误监控

```typescript
// apps/learning/src/lib/monitoring.ts
export function logError(error: Error, context?: Record<string, any>) {
  // 发送到错误监控服务（如Sentry）
  console.error('Error:', error, context);
  
  // 生产环境发送到监控服务
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context });
  }
}

export function logApiCall(endpoint: string, duration: number, status: number) {
  // 记录API调用性能
  console.log(`API Call: ${endpoint} - ${duration}ms - ${status}`);
}
```

---

## ✅ 检查清单

### 每个功能模块完成后

- [ ] API服务已创建
- [ ] React Query hooks已创建
- [ ] 页面组件已更新
- [ ] 错误处理已添加
- [ ] Loading状态已添加
- [ ] 单元测试已编写
- [ ] 集成测试已编写
- [ ] 文档已更新
- [ ] Code Review已完成
- [ ] QA测试已通过

---

## 🚨 常见问题

### Q1: 如何处理API错误？

```typescript
// 使用React Query的错误处理
const { data, error } = useCourses();

if (error) {
  return <ErrorMessage message={error.message} />;
}
```

### Q2: 如何处理认证失败？

```typescript
// 在API客户端中统一处理401
if (response.status === 401) {
  // 清除token
  localStorage.removeItem('auth_token');
  // 重定向到登录页
  window.location.href = '/auth/login';
}
```

### Q3: 如何优化性能？

```typescript
// 使用React Query的缓存和预取
queryClient.prefetchQuery({
  queryKey: ['courses'],
  queryFn: coursesApi.getAll,
});
```

---

## 📞 支持

如遇到问题，请：
1. 查看本文档
2. 检查代码健康度分析报告
3. 联系技术负责人
