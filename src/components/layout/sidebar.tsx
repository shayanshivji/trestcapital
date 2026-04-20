"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { cn } from "@/lib/utils";
import { ActivityForm } from "@/components/forms/activity-form";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { GlobalSearch } from "@/components/layout/global-search";
import {
  LayoutDashboard,
  GitBranch,
  Building2,
  Users,
  Activity,
  Radar,
  Search,
  Plus,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";

const baseNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deals", label: "Deal Flow", icon: GitBranch, badgeKey: "deals" as const },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/intelligence", label: "Intelligence", icon: Radar, badgeKey: "intel" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { deals, activities, indications } = useData();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const activeDeals = deals.filter((d) => !["closed_won", "passed", "dead"].includes(d.stage));
  const unreviewedCount = indications.filter((i) => !i.reviewed).length;
  const overdueItems = activities.flatMap((a) =>
    (a.actionItems || []).filter((item) => !item.done && item.dueDate && new Date(item.dueDate) < new Date())
  );
  const notifCount = unreviewedCount + overdueItems.length;

  const badgeCounts: Record<string, number> = {
    deals: activeDeals.length,
    intel: indications.length,
  };

  const navItems = baseNavItems.map((item) => ({
    ...item,
    badge: item.badgeKey ? badgeCounts[item.badgeKey] || undefined : undefined,
  }));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if ((e.target as HTMLElement)?.isContentEditable) return;
        e.preventDefault();
        setShowSearch(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-[240px] bg-sidebar flex flex-col z-50">
        {/* Logo */}
        <div className="px-5 py-4 flex items-center gap-3">
          <Image
            src="/trest-logo.png"
            alt="Trest Capital"
            width={36}
            height={36}
            className="shrink-0"
          />
          <div>
            <h1 className="text-white font-bold text-[15px] leading-none tracking-tight">
              Trest Capital
            </h1>
            <p className="text-neutral-500 text-[11px] mt-0.5">Capital Advisory</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 mb-2">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-hover text-neutral-400 text-sm hover:text-white transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] text-neutral-600 bg-sidebar px-1.5 py-0.5 rounded border border-neutral-700">
              /
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-link",
                  isActive && "sidebar-link-active"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[11px] font-medium px-1.5 py-0.5 rounded-full",
                      isActive
                        ? "bg-brand-500/30 text-brand-200"
                        : "bg-neutral-800 text-neutral-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-3 space-y-0.5 border-t border-neutral-800">
          <button onClick={() => setShowActivityForm(true)} className="sidebar-link w-full">
            <Plus className="h-[18px] w-[18px]" />
            <span className="flex-1">Log Activity</span>
          </button>
          <button onClick={() => setShowNotifications(true)} className="sidebar-link w-full">
            <Bell className="h-[18px] w-[18px]" />
            <span className="flex-1">Notifications</span>
            {notifCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500 text-white min-w-[18px] text-center">
                {notifCount}
              </span>
            )}
          </button>
          <Link href="/settings" className={cn("sidebar-link", pathname === "/settings" && "sidebar-link-active")}>
            <Settings className="h-[18px] w-[18px]" />
            <span className="flex-1">Settings</span>
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-3 border-t border-neutral-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-800 flex items-center justify-center text-brand-200 text-xs font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.name || "—"}
            </p>
            <p className="text-neutral-500 text-[11px] truncate">{user?.role || "—"}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-sidebar-hover transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <ActivityForm open={showActivityForm} onClose={() => setShowActivityForm(false)} />
      <NotificationsPanel open={showNotifications} onClose={() => setShowNotifications(false)} />
      <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
