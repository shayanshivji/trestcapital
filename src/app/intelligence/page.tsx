"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IndicationForm } from "@/components/forms/indication-form";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  Indication, IndicationSide, IndicationSource,
  INDICATION_SOURCE_CONFIG, WEB_INTEL_TYPE_CONFIG,
} from "@/types";
import {
  Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Building2,
  Target, Search, Pencil, Trash2, CheckCircle2, ExternalLink,
  FileText, Globe, Database, UserCheck, BarChart3, Newspaper,
  Radar, Phone, Bot, User, Eye, Sparkles,
} from "lucide-react";

const sideConfig: Record<IndicationSide, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "success" | "danger" | "warning";
  color: string;
  bgColor: string;
}> = {
  buy: { label: "BUY", icon: ArrowUpRight, variant: "success", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  sell: { label: "SELL", icon: ArrowDownRight, variant: "danger", color: "text-rose-600", bgColor: "bg-rose-50" },
  both: { label: "BUY/SELL", icon: ArrowLeftRight, variant: "warning", color: "text-amber-600", bgColor: "bg-amber-50" },
};

const webIntelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Newspaper, Database, UserCheck, BarChart3, Globe,
};

const sourceIcons: Record<IndicationSource, React.ComponentType<{ className?: string }>> = {
  manual: User,
  relationship: Phone,
  web_intel: Bot,
};

type TabFilter = "all" | IndicationSource;

export default function IntelligencePage() {
  const { indications, deleteIndication, reviewIndication } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingIndication, setEditingIndication] = useState<Indication | undefined>();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentResult, setAgentResult] = useState<{ scraped: number; signals: number; saved: number } | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  async function runAgent() {
    setAgentRunning(true);
    setAgentResult(null);
    setAgentError(null);
    try {
      const res = await fetch("/api/intel/run", { method: "POST" });
      if (!res.ok) {
        setAgentError(`Server error (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAgentResult({ scraped: data.scraped, signals: data.signals, saved: data.saved });
      } else {
        setAgentError(data.error || "Unknown error");
      }
    } catch (err: any) {
      setAgentError(err.message || "Network error");
    } finally {
      setAgentRunning(false);
    }
  }

  const counts = useMemo(() => ({
    all: indications.length,
    manual: indications.filter((i) => i.source === "manual").length,
    relationship: indications.filter((i) => i.source === "relationship").length,
    web_intel: indications.filter((i) => i.source === "web_intel").length,
    unreviewed: indications.filter((i) => !i.reviewed).length,
  }), [indications]);

  const filtered = useMemo(() => {
    let result = indications;
    if (activeTab !== "all") result = result.filter((i) => i.source === activeTab);
    if (showUnreviewedOnly) result = result.filter((i) => !i.reviewed);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        (i.firm?.name.toLowerCase().includes(q) ?? false) ||
        (i.company?.name.toLowerCase().includes(q) ?? false) ||
        (i.sector?.name.toLowerCase().includes(q) ?? false) ||
        (i.notes?.toLowerCase().includes(q) ?? false)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [indications, activeTab, showUnreviewedOnly, search]);

  const tabs: { key: TabFilter; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { key: "all", label: "All Signals", icon: Radar, count: counts.all },
    { key: "relationship", label: "Relationships", icon: Phone, count: counts.relationship },
    { key: "web_intel", label: "Web Intel", icon: Bot, count: counts.web_intel },
    { key: "manual", label: "Manual", icon: User, count: counts.manual },
  ];

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Intelligence Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Market signals from your network, the web, and manual entry
          </p>
        </div>
        <div className="flex items-center gap-2">
          {agentError && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-xs font-medium text-red-700">
                Agent error: {agentError}
              </span>
              <button onClick={() => setAgentError(null)} className="text-red-400 hover:text-red-600 ml-1">×</button>
            </div>
          )}
          {agentResult && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                Scraped {agentResult.scraped} → {agentResult.signals} signals → {agentResult.saved} saved
              </span>
            </div>
          )}
          {counts.unreviewed > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">{counts.unreviewed} to review</span>
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={runAgent} disabled={agentRunning}>
            {agentRunning ? (
              <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Scanning...</>
            ) : (
              <><Bot className="h-3.5 w-3.5" /> Run Agent</>
            )}
          </Button>
          <Button size="sm" onClick={() => { setEditingIndication(undefined); setShowForm(true); }}>
            <Plus className="h-3.5 w-3.5" /> Add Signal
          </Button>
        </div>
      </div>

      {/* Source Breakdown Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">From Relationships</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{counts.relationship}</p>
              <p className="text-xs text-slate-400 mt-0.5">Calls, emails, meetings</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Web Intelligence</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{counts.web_intel}</p>
              <p className="text-xs text-slate-400 mt-0.5">SEC, news, fund data, LinkedIn</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Manual Entry</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{counts.manual}</p>
              <p className="text-xs text-slate-400 mt-0.5">Team-entered signals</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"
                }`}>{tab.count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUnreviewedOnly(!showUnreviewedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              showUnreviewedOnly
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Needs Review
            {counts.unreviewed > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]">{counts.unreviewed}</span>
            )}
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by firm, sector, company, or keywords..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      {/* Signal List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><p className="text-sm text-slate-400 text-center py-6">No signals match your filters.</p></Card>
        ) : (
          filtered.map((indication) => (
            <SignalCard
              key={indication.id}
              indication={indication}
              onEdit={() => { setEditingIndication(indication); setShowForm(true); }}
              onDelete={() => { if (confirm("Delete this signal?")) deleteIndication(indication.id); }}
              onReview={() => reviewIndication(indication.id)}
            />
          ))
        )}
      </div>

      <IndicationForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingIndication(undefined); }}
        indication={editingIndication}
      />
    </div>
  );
}

function SignalCard({
  indication, onEdit, onDelete, onReview,
}: {
  indication: Indication;
  onEdit: () => void;
  onDelete: () => void;
  onReview: () => void;
}) {
  const config = sideConfig[indication.side];
  const SideIcon = config.icon;
  const sourceConfig = INDICATION_SOURCE_CONFIG[indication.source];
  const SourceIcon = sourceIcons[indication.source];

  const webTypeConfig = indication.webIntelType ? WEB_INTEL_TYPE_CONFIG[indication.webIntelType] : null;
  const WebIcon = webTypeConfig ? webIntelIcons[webTypeConfig.icon] : null;

  const isUnreviewed = !indication.reviewed;

  return (
    <Card hover className={isUnreviewed ? "ring-1 ring-amber-200 bg-amber-50/20" : ""}>
      <div className="flex gap-4">
        <div className={`h-12 w-12 rounded-xl ${config.bgColor} ${config.color} flex items-center justify-center shrink-0`}>
          <SideIcon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={config.variant} size="md">{config.label}</Badge>
              {indication.firm && (
                <span className="text-sm font-semibold text-slate-900">{indication.firm.name}</span>
              )}
              {/* Source badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sourceConfig.bgColor} ${sourceConfig.color}`}>
                <SourceIcon className="h-3 w-3" />
                {sourceConfig.label}
              </span>
              {/* Web intel type */}
              {webTypeConfig && WebIcon && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-50 text-violet-600">
                  <WebIcon className="h-3 w-3" />
                  {webTypeConfig.label}
                </span>
              )}
              {/* Confidence */}
              {indication.confidence != null && indication.confidence < 1 && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  indication.confidence >= 0.85 ? "bg-emerald-50 text-emerald-600" :
                  indication.confidence >= 0.7 ? "bg-amber-50 text-amber-600" :
                  "bg-red-50 text-red-600"
                }`}>
                  {Math.round(indication.confidence * 100)}% conf
                </span>
              )}
              {isUnreviewed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                  <Eye className="h-3 w-3" /> Needs Review
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {isUnreviewed && (
                <button
                  onClick={onReview}
                  className="p-1 rounded-md hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Mark as reviewed"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={onEdit} className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs text-slate-400 ml-1">{formatRelativeTime(indication.createdAt)}</span>
            </div>
          </div>

          {indication.notes && (
            <p className="text-sm text-slate-600 mb-2 leading-relaxed">{indication.notes}</p>
          )}

          <div className="flex items-center gap-4 flex-wrap">
            {indication.company ? (
              <Link href={`/companies/${indication.companyId}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 transition-colors">
                <Building2 className="h-3 w-3" />{indication.company.name}
              </Link>
            ) : indication.sector ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Target className="h-3 w-3" />{indication.sector.name}
              </div>
            ) : null}

            {(indication.sizeMinMm || indication.sizeMaxMm) && (
              <span className="text-xs text-slate-500">
                {indication.sizeMinMm && indication.sizeMaxMm
                  ? `${formatCurrency(indication.sizeMinMm)} – ${formatCurrency(indication.sizeMaxMm)}`
                  : indication.sizeMinMm
                    ? `${formatCurrency(indication.sizeMinMm)}+`
                    : `Up to ${formatCurrency(indication.sizeMaxMm!)}`}
              </span>
            )}

            {indication.contact && (
              <Link href={`/contacts/${indication.contactId}`} className="flex items-center gap-1.5 hover:opacity-80">
                <Avatar firstName={indication.contact.firstName} lastName={indication.contact.lastName} size="sm" />
                <span className="text-xs text-slate-500">{indication.contact.firstName} {indication.contact.lastName}</span>
              </Link>
            )}

            {indication.webIntelUrl && (
              <a
                href={indication.webIntelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> Source
              </a>
            )}

            {indication.sourceActivityId && (
              <span className="text-xs text-slate-400">
                Extracted from activity
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
