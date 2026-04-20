"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DealForm } from "@/components/forms/deal-form";
import { ActivityForm } from "@/components/forms/activity-form";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { DEAL_STAGE_CONFIG, PIPELINE_STAGES, DEAL_TYPE_LABELS, ACTIVITY_TYPE_CONFIG } from "@/types";
import {
  Plus, PhoneCall, AlertCircle, ArrowRight, TrendingUp, GitBranch,
  DollarSign, FileSearch, Clock, Building2, ChevronRight,
  Phone, Video, Users, Mail, FileText, MessageSquare,
  Target,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, Video, Users, Mail, FileText, MessageSquare,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { deals, activities, indications, contacts } = useData();
  const [showDealForm, setShowDealForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  const activeDeals = deals.filter((d) => !["closed_won", "passed", "dead"].includes(d.stage));
  const totalPipelineValue = activeDeals.reduce((s, d) => s + (d.enterpriseValueMm || 0), 0);
  const totalEquity = activeDeals.reduce((s, d) => s + (d.equityCheckMm || 0), 0);
  const dealsInDD = deals.filter((d) => d.stage === "due_diligence").length;
  const dealsAtLOI = deals.filter((d) => d.stage === "loi_bid" || d.stage === "exclusivity" || d.stage === "closing").length;

  // Deals needing attention: approaching close, high priority, or stalled
  const urgentDeals = activeDeals
    .filter((d) => {
      if (d.priority <= 2) return true;
      if (d.expectedCloseDate) {
        const daysToClose = Math.ceil((new Date(d.expectedCloseDate).getTime() - Date.now()) / 86400000);
        return daysToClose <= 30;
      }
      return false;
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  // All open action items across activities
  const openActionItems = activities
    .flatMap((a) =>
      (a.actionItems || [])
        .filter((item) => !item.done)
        .map((item) => ({ ...item, activityTitle: a.title, dealId: a.dealId, dealTitle: a.deal?.title }))
    )
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 8);

  // Last 24h activities
  const recent24h = activities.filter((a) => {
    const hoursAgo = (Date.now() - new Date(a.occurredAt).getTime()) / 3600000;
    return hoursAgo <= 24;
  });

  // New indications (last 7 days)
  const recentIndications = indications.filter((i) => {
    const daysAgo = (Date.now() - new Date(i.createdAt).getTime()) / 86400000;
    return daysAgo <= 7 && i.isActive;
  });

  // Pipeline by stage for velocity view
  const stageData = PIPELINE_STAGES.map((stage) => {
    const stageDeals = activeDeals.filter((d) => d.stage === stage);
    return { stage, config: DEAL_STAGE_CONFIG[stage], count: stageDeals.length, ev: stageDeals.reduce((s, d) => s + (d.enterpriseValueMm || 0), 0) };
  });

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="p-6">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowActivityForm(true)}>
            <PhoneCall className="h-3.5 w-3.5" /> Log Call
          </Button>
          <Button size="sm" onClick={() => setShowDealForm(true)}>
            <Plus className="h-3.5 w-3.5" /> New Deal
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Deals</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeDeals.length}</p>
              <p className="text-xs text-slate-400 mt-1">{dealsInDD} in DD · {dealsAtLOI} at LOI+</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-500 flex items-center justify-center shrink-0">
              <GitBranch className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pipeline Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalPipelineValue)}</p>
              <p className="text-xs text-slate-400 mt-1">{formatCurrency(totalEquity)} equity</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Today&apos;s Activity</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{recent24h.length}</p>
              <p className="text-xs text-slate-400 mt-1">interactions in 24h</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
              <FileSearch className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Market Signals</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{recentIndications.length}</p>
              <p className="text-xs text-slate-400 mt-1">new indications this week</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: 2 cols */}
        <div className="lg:col-span-2 space-y-4">

          {/* Deals Needing Attention */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Deals Needing Attention
              </CardTitle>
              <Link href="/deals" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                All deals <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <div>
              {urgentDeals.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-slate-400">No deals needing immediate attention.</div>
              )}
              {urgentDeals.map((deal) => {
                const stageConfig = DEAL_STAGE_CONFIG[deal.stage];
                const daysToClose = deal.expectedCloseDate ? Math.max(0, Math.ceil((new Date(deal.expectedCloseDate).getTime() - Date.now()) / 86400000)) : null;
                return (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors group">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${deal.priority === 1 ? "bg-red-500" : deal.priority === 2 ? "bg-amber-500" : "bg-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{deal.title}</span>
                        <Badge className={`${stageConfig.bgColor} ${stageConfig.color}`} size="sm">{stageConfig.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                        {deal.company && <span>{deal.company.name}</span>}
                        {deal.enterpriseValueMm && <span>{formatCurrency(deal.enterpriseValueMm)} EV</span>}
                        {deal.dealType && <span>{DEAL_TYPE_LABELS[deal.dealType]}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {daysToClose !== null && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${daysToClose <= 14 ? "bg-red-50 text-red-700" : daysToClose <= 30 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"}`}>
                          {daysToClose}d
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Open Action Items */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Open Action Items
              </CardTitle>
              <span className="text-xs text-slate-400">{openActionItems.length} pending</span>
            </CardHeader>
            {openActionItems.length === 0 ? (
              <div className="px-4 pb-4 text-sm text-slate-400">All caught up.</div>
            ) : (
              <div>
                {openActionItems.map((item, i) => {
                  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-100 last:border-b-0">
                      <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${isOverdue ? "text-red-500" : "text-amber-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium">{item.text}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          {item.assignee && <span>{item.assignee}</span>}
                          {item.dueDate && (
                            <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                              {isOverdue ? "Overdue · " : ""}Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          {item.dealTitle && (
                            <Link href={`/deals/${item.dealId}`} className="text-brand-600 hover:text-brand-700">
                              {item.dealTitle}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Last 24h Activity */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle>Last 24 Hours</CardTitle>
              <Link href="/activity" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Full feed <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <div>
              {recent24h.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-slate-400">No activity in the last 24 hours.</div>
              )}
              {recent24h.slice(0, 6).map((activity) => {
                const config = ACTIVITY_TYPE_CONFIG[activity.activityType];
                const IconComponent = iconMap[config.icon];
                return (
                  <Link
                    key={activity.id}
                    href={activity.dealId ? `/deals/${activity.dealId}` : "/activity"}
                    className="flex gap-3 px-4 py-2.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors group"
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 ${config.color}`}>
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium truncate group-hover:text-brand-600 transition-colors">{activity.title}</p>
                      {activity.summary && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{activity.summary}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {activity.deal && <Badge variant="info" size="sm">{activity.deal.title}</Badge>}
                        {activity.sentiment && (
                          <Badge variant={activity.sentiment === "positive" ? "success" : activity.sentiment === "negative" ? "danger" : "default"} size="sm">
                            {activity.sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 pt-0.5 whitespace-nowrap">{formatRelativeTime(activity.occurredAt)}</span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Pipeline Velocity */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Velocity</CardTitle>
              <Link href="/deals" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                View <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <div className="space-y-2.5">
              {stageData.map(({ stage, config, count, ev }) => (
                <div key={stage} className="flex items-center gap-2">
                  <div className="w-20 text-xs text-slate-500 font-medium truncate">{config.label}</div>
                  <div className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden relative">
                    {ev > 0 && totalPipelineValue > 0 && (
                      <div
                        className={`h-full rounded-md ${config.bgColor} opacity-70`}
                        style={{ width: `${Math.max((ev / totalPipelineValue) * 100, 6)}%` }}
                      />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium w-8 text-right">{count}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Market Signals */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-400" />
                Market Signals
              </CardTitle>
              <Link href="/intelligence" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <div>
              {recentIndications.slice(0, 5).map((ind) => (
                <div key={ind.id} className="px-4 py-2.5 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant={ind.side === "buy" ? "success" : ind.side === "sell" ? "danger" : "warning"} size="sm">
                      {ind.side.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium text-slate-900">{ind.firm?.name}</span>
                  </div>
                  {ind.notes && <p className="text-xs text-slate-500 line-clamp-1">{ind.notes}</p>}
                  <div className="flex items-center gap-2 mt-0.5">
                    {ind.company && <span className="text-xs text-slate-400">{ind.company.name}</span>}
                    {ind.sector && <span className="text-xs text-slate-400">{ind.sector.name}</span>}
                    {ind.sizeMinMm && ind.sizeMaxMm && (
                      <span className="text-xs text-slate-400">{formatCurrency(ind.sizeMinMm)}–{formatCurrency(ind.sizeMaxMm)}</span>
                    )}
                  </div>
                </div>
              ))}
              {recentIndications.length === 0 && (
                <div className="px-4 pb-4 text-sm text-slate-400">No new signals this week.</div>
              )}
            </div>
          </Card>

          {/* Key Relationships — recent contacts */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle>Key Relationships</CardTitle>
              <Link href="/contacts" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <div>
              {contacts.filter((c) => c.lastContactedAt).length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-slate-400">No recent contacts.</div>
              )}
              {contacts
                .filter((c) => c.lastContactedAt)
                .sort((a, b) => new Date(b.lastContactedAt!).getTime() - new Date(a.lastContactedAt!).getTime())
                .slice(0, 5)
                .map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors group"
                  >
                    <Avatar firstName={contact.firstName} lastName={contact.lastName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-brand-600 transition-colors">{contact.firstName} {contact.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{contact.firm?.name}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{formatRelativeTime(contact.lastContactedAt!)}</span>
                  </Link>
                ))}
            </div>
          </Card>
        </div>
      </div>

      <DealForm open={showDealForm} onClose={() => setShowDealForm(false)} />
      <ActivityForm open={showActivityForm} onClose={() => setShowActivityForm(false)} />
    </div>
  );
}
