"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import { DEAL_STAGE_CONFIG, ACTIVITY_TYPE_CONFIG } from "@/types";
import { cn } from "@/lib/utils";
import {
  Search, X, GitBranch, Building2, Users, Activity,
  Radar, ArrowRight, CornerDownLeft,
} from "lucide-react";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

type ResultCategory = "deals" | "companies" | "contacts" | "activities" | "signals";

interface SearchResult {
  id: string;
  category: ResultCategory;
  title: string;
  subtitle: string;
  href: string;
  badge?: { label: string; color: string; bgColor: string };
}

const CATEGORY_META: Record<ResultCategory, { label: string; icon: React.ElementType }> = {
  deals: { label: "Deals", icon: GitBranch },
  companies: { label: "Companies", icon: Building2 },
  contacts: { label: "Contacts", icon: Users },
  activities: { label: "Activities", icon: Activity },
  signals: { label: "Intelligence", icon: Radar },
};

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const { deals, companies, contacts, activities, indications } = useData();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const out: SearchResult[] = [];

    for (const deal of deals) {
      const searchable = [deal.title, deal.company?.name, deal.description, deal.thesis, deal.stage].filter(Boolean).join(" ").toLowerCase();
      if (searchable.includes(q)) {
        const stageConfig = DEAL_STAGE_CONFIG[deal.stage];
        out.push({
          id: deal.id,
          category: "deals",
          title: deal.title,
          subtitle: [deal.company?.name, stageConfig.label].filter(Boolean).join(" · "),
          href: `/deals/${deal.id}`,
          badge: stageConfig,
        });
      }
    }

    for (const co of companies) {
      const searchable = [co.name, co.codename, co.description, co.hqCity, co.hqState, co.sector?.name].filter(Boolean).join(" ").toLowerCase();
      if (searchable.includes(q)) {
        out.push({
          id: co.id,
          category: "companies",
          title: co.name,
          subtitle: [co.sector?.name, co.hqCity && co.hqState ? `${co.hqCity}, ${co.hqState}` : co.hqCity || co.hqState].filter(Boolean).join(" · "),
          href: `/companies/${co.id}`,
        });
      }
    }

    for (const c of contacts) {
      const searchable = [c.firstName, c.lastName, c.email, c.title, c.firm?.name, c.role].filter(Boolean).join(" ").toLowerCase();
      if (searchable.includes(q)) {
        out.push({
          id: c.id,
          category: "contacts",
          title: `${c.firstName} ${c.lastName}`,
          subtitle: [c.title, c.firm?.name].filter(Boolean).join(" at "),
          href: `/contacts/${c.id}`,
        });
      }
    }

    for (const a of activities) {
      const searchable = [a.title, a.summary, a.deal?.title, a.company?.name].filter(Boolean).join(" ").toLowerCase();
      if (searchable.includes(q)) {
        const typeConfig = ACTIVITY_TYPE_CONFIG[a.activityType];
        out.push({
          id: a.id,
          category: "activities",
          title: a.title,
          subtitle: [typeConfig.label, a.deal?.title].filter(Boolean).join(" · "),
          href: a.dealId ? `/deals/${a.dealId}` : "/activity",
        });
      }
    }

    for (const ind of indications) {
      const searchable = [ind.notes, ind.firm?.name, ind.company?.name, ind.sector?.name, ind.side].filter(Boolean).join(" ").toLowerCase();
      if (searchable.includes(q)) {
        out.push({
          id: ind.id,
          category: "signals",
          title: ind.notes?.slice(0, 80) || `${ind.side.toUpperCase()} signal`,
          subtitle: [ind.firm?.name, ind.company?.name, ind.sector?.name].filter(Boolean).join(" · ") || ind.source,
          href: "/intelligence",
          badge: {
            label: ind.side.toUpperCase(),
            color: ind.side === "buy" ? "text-emerald-700" : ind.side === "sell" ? "text-red-700" : "text-amber-700",
            bgColor: ind.side === "buy" ? "bg-emerald-100" : ind.side === "sell" ? "bg-red-100" : "bg-amber-100",
          },
        });
      }
    }

    return out.slice(0, 20);
  }, [query, deals, companies, contacts, activities, indications]);

  const grouped = useMemo(() => {
    const map = new Map<ResultCategory, SearchResult[]>();
    for (const r of results) {
      const arr = map.get(r.category) || [];
      arr.push(r);
      map.set(r.category, arr);
    }
    return map;
  }, [results]);

  const flatResults = results;

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flatResults.length > 0) setSelectedIdx((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flatResults.length > 0) setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && flatResults[selectedIdx]) {
      e.preventDefault();
      navigateTo(flatResults[selectedIdx].href);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  function navigateTo(href: string) {
    onClose();
    router.push(href);
  }

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector("[data-active='true']");
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search deals, companies, contacts, activities..."
            className="flex-1 text-base text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="px-5 py-10 text-center">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Start typing to search across everything</p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[10px]"><CornerDownLeft className="h-3 w-3 inline" /></kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[10px]">ESC</kbd> Close</span>
              </div>
            </div>
          ) : flatResults.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-500">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try a different keyword or check your spelling</p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => {
              const meta = CATEGORY_META[category];
              return (
                <div key={category}>
                  <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <meta.icon className="h-3.5 w-3.5" />
                      {meta.label}
                      <span className="text-slate-400 font-normal">({items.length})</span>
                    </p>
                  </div>
                  {items.map((result) => {
                    runningIdx++;
                    const isActive = runningIdx === selectedIdx;
                    const idx = runningIdx;
                    return (
                      <button
                        key={result.id}
                        data-active={isActive}
                        onClick={() => navigateTo(result.href)}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        className={cn(
                          "w-full text-left flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer border-b border-slate-50",
                          isActive ? "bg-brand-50" : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isActive ? "text-brand-700" : "text-slate-900"
                          )}>
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{result.subtitle}</p>
                          )}
                        </div>
                        {result.badge && (
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", result.badge.bgColor, result.badge.color)}>
                            {result.badge.label}
                          </span>
                        )}
                        <ArrowRight className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-brand-400" : "text-slate-300"
                        )} />
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {flatResults.length > 0 && (
          <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{flatResults.length} result{flatResults.length !== 1 ? "s" : ""}</span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 font-mono text-[10px]">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 font-mono text-[10px]"><CornerDownLeft className="h-2.5 w-2.5 inline" /></kbd> Open</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
