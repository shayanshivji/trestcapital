"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { DataProvider } from "@/lib/data-context";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <AuthProvider>
      <AuthGuard>
        {isLogin ? (
          children
        ) : (
          <DataProvider>
            <Sidebar />
            <div className="ml-[240px] min-h-screen">
              {children}
            </div>
          </DataProvider>
        )}
      </AuthGuard>
    </AuthProvider>
  );
}
