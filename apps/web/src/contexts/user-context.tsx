"use client";

import * as React from "react";
import type { CurrentUser } from "@/app/api/auth/me/route";

type UserContextType = {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (updates: Partial<CurrentUser>) => void;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUser = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          return;
        }
        throw new Error("Failed to fetch user");
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = React.useCallback((updates: Partial<CurrentUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      error,
      refetch: fetchUser,
      updateUser,
    }),
    [user, isLoading, error, fetchUser, updateUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
