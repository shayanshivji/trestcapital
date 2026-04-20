"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { INDICATION_SOURCE_CONFIG } from "@/types";
import {
  X, AlertCircle, Bot, Phone, Clock, CheckCircle2, Sparkles,
  ChevronRight, ExternalLink,
} from "lucide-react";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { activities, indications, reviewIndication } = useData();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function navigateTo(path: string) {
    onClose();
    router.push(path);
  }

  const unreviewedSignals = indications
    .filter((i) => !i.reviewed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const overdueItems = activities.flatMap((a) =>
    (a.actionItems || [])
      .filter((item) => !item.done && item.dueDate && new Date(item.dueDate) < new Date())
      .map((item) => ({
        ...item,
        activityId: a.id,
        activityTitle: a.title,
        dealId: a.dealId,
        dealTitle: a.deal?.title,
        companyId: a.companyId,
      }))
  );

  const upcomingItems = activities.flatMap((a) =>
    (a.actionItems || [])
      .filter((item) => {
        if (item.done || !item.dueDate) return false;
        const due = new Date(item.dueDate);
        const now = new Date();
        const daysUntil = (due.getTime() - now.getTime()) / 86400000;
        return daysUntil >= 0 && daysUntil <= 3;
      })
      .map((item) => ({
        ...item,
        activityId: a.id,
        activityTitle: a.title,
        dealId: a.dealId,
        dealTitle: a.deal?.title,
        companyId: a.companyId,
      }))
  );

  const totalCount = unreviewedSignals.length + overdueItems.length + upcomingItems.length;

  function getActionItemHref(item: { dealId?: string; companyId?: string }) {
    if (item.dealId) return `/deals/${item.dealId}`;
    if (item.companyId) return `/companies/${item.companyId}`;
    return "/activity";
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100]"
    >
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-[400px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            {totalCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                {totalCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <CheckCircle2 className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">All caught up</p>
              <p className="text-xs mt-0.5">No pending notifications</p>
            </div>
          ) : (
            <>
              {/* Overdue Action Items */}
              {overdueItems.length > 0 && (
                <div>
                  <div className="px-5 py-2.5 bg-red-50 border-b border-red-100">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Overdue ({overdueItems.length})
                    </p>
                  </div>
                  {overdueItems.map((item, i) => (
                    <button
                      key={`overdue-${i}`}
                      onClick={() => navigateTo(getActionItemHref(item))}
                      className="w-full text-left px-5 py-3 border-b border-slate-100 hover:bg-red-50/40 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-red-700 transition-colors">
                            {item.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            {item.assignee && <span>{item.assignee}</span>}
                            {item.dueDate && (
                              <span className="text-red-500 font-medium">
                                Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                            {item.dealTitle && (
                              <span className="text-brand-600 font-medium">{item.dealTitle}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-red-400 shrink-0 mt-0.5 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Due Soon */}
              {upcomingItems.length > 0 && (
                <div>
                  <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Due Soon ({upcomingItems.length})
                    </p>
                  </div>
                  {upcomingItems.map((item, i) => (
                    <button
                      key={`upcoming-${i}`}
                      onClick={() => navigateTo(getActionItemHref(item))}
                      className="w-full text-left px-5 py-3 border-b border-slate-100 hover:bg-amber-50/40 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-amber-700 transition-colors">
                            {item.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            {item.assignee && <span>{item.assignee}</span>}
                            {item.dueDate && (
                              <span className="text-amber-600 font-medium">
                                Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                            {item.dealTitle && (
                              <span className="text-brand-600 font-medium">{item.dealTitle}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Unreviewed Signals */}
              {unreviewedSignals.length > 0 && (
                <div>
                  <div className="px-5 py-2.5 bg-violet-50 border-b border-violet-100">
                    <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Signals to Review ({unreviewedSignals.length})
                    </p>
                  </div>
                  {unreviewedSignals.map((signal) => {
                    const sourceConfig = INDICATION_SOURCE_CONFIG[signal.source];
                    const signalHref = signal.companyId
                      ? `/companies/${signal.companyId}`
                      : signal.firm?.id
                        ? `/companies/${signal.firm.id}`
                        : "/intelligence";

                    return (
                      <div
                        key={signal.id}
                        className="border-b border-slate-100 hover:bg-violet-50/30 transition-colors group"
                      >
                        <button
                          onClick={() => navigateTo(signalHref)}
                          className="w-full text-left px-5 pt-3 pb-1 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <Badge
                                  variant={signal.side === "buy" ? "success" : signal.side === "sell" ? "danger" : "warning"}
                                  size="sm"
                                >
                                  {signal.side.toUpperCase()}
                                </Badge>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sourceConfig.bgColor} ${sourceConfig.color}`}>
                                  {signal.source === "web_intel" ? <Bot className="h-3 w-3 inline mr-0.5" /> : <Phone className="h-3 w-3 inline mr-0.5" />}
                                  {sourceConfig.label}
                                </span>
                                {signal.confidence != null && signal.confidence < 1 && (
                                  <span className="text-[10px] text-slate-400">{Math.round(signal.confidence * 100)}%</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-700 group-hover:text-violet-700 transition-colors line-clamp-2">
                                {signal.notes}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-violet-400 shrink-0 mt-0.5 transition-colors" />
                          </div>
                        </button>
                        <div className="flex items-center justify-between px-5 pb-3 pt-1">
                          <span className="text-[11px] text-slate-400">{formatRelativeTime(signal.createdAt)}</span>
                          <div className="flex items-center gap-1.5">
                            {signal.webIntelUrl && (
                              <a
                                href={signal.webIntelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Open source"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                reviewIndication(signal.id);
                              }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Mark as reviewed"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Review</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
          <Link
            href="/intelligence"
            onClick={onClose}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            View all in Intelligence Hub →
          </Link>
        </div>
      </div>
    </div>
  );
}
