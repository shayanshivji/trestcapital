"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { PipelineBoard } from "@/components/deals/pipeline-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DealForm } from "@/components/forms/deal-form";
import { formatCurrency } from "@/lib/utils";
import { DEAL_STAGE_CONFIG, DEAL_TYPE_LABELS } from "@/types";
import { Plus, List, LayoutGrid, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "board" | "list";

export default function DealsPage() {
  const [showDealForm, setShowDealForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const { deals } = useData();

  const activeDeals = deals.filter((d) => !["closed_won", "passed", "dead"].includes(d.stage));

  return (
    <div className="p-6 h-[calc(100vh-0px)] flex flex-col">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deal Flow</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track every deal from sourcing through close
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium border-r border-slate-300 transition-colors",
                viewMode === "board" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button size="sm" onClick={() => setShowDealForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            New Deal
          </Button>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <PipelineBoard />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Card padding="none" className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Deal</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Company</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Stage</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Type</th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">EV</th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Equity</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {activeDeals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                      No active deals. Create one to get started.
                    </td>
                  </tr>
                )}
                {activeDeals
                  .sort((a, b) => a.priority - b.priority)
                  .map((deal) => {
                    const stageConfig = DEAL_STAGE_CONFIG[deal.stage];
                    return (
                      <tr key={deal.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/deals/${deal.id}`} className="group">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{deal.title}</p>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{deal.company?.name || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${stageConfig.bgColor} ${stageConfig.color}`} size="sm">{stageConfig.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500">{deal.dealType ? DEAL_TYPE_LABELS[deal.dealType] : "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium text-slate-900">{deal.enterpriseValueMm ? formatCurrency(deal.enterpriseValueMm) : "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-slate-600">{deal.equityCheckMm ? formatCurrency(deal.equityCheckMm) : "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/deals/${deal.id}`} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors inline-flex">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      <DealForm open={showDealForm} onClose={() => setShowDealForm(false)} />
    </div>
  );
}
