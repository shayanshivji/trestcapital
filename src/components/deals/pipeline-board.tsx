"use client";

import { useData } from "@/lib/data-context";
import { DEAL_STAGE_CONFIG, PIPELINE_STAGES } from "@/types";
import { DealCard } from "./deal-card";
import { formatCurrency } from "@/lib/utils";

export function PipelineBoard() {
  const { deals } = useData();

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 h-full">
      {PIPELINE_STAGES.map((stage) => {
        const config = DEAL_STAGE_CONFIG[stage];
        const stageDeals = deals.filter((d) => d.stage === stage);
        const totalEv = stageDeals.reduce(
          (sum, d) => sum + (d.enterpriseValueMm || 0),
          0
        );

        return (
          <div key={stage} className="flex flex-col w-[260px] shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: config.bgColor.includes("slate")
                      ? "#94a3b8"
                      : config.bgColor.includes("blue")
                        ? "#3b82f6"
                        : config.bgColor.includes("cyan")
                          ? "#06b6d4"
                          : config.bgColor.includes("violet")
                            ? "#8b5cf6"
                            : config.bgColor.includes("amber")
                              ? "#f59e0b"
                              : config.bgColor.includes("orange")
                                ? "#f97316"
                                : config.bgColor.includes("emerald")
                                  ? "#10b981"
                                  : "#94a3b8",
                  }}
                />
                <span className="text-sm font-semibold text-slate-700 truncate">
                  {config.label}
                </span>
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                  {stageDeals.length}
                </span>
              </div>
              {totalEv > 0 && (
                <span className="text-xs text-slate-400 font-medium shrink-0">
                  {formatCurrency(totalEv)}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin bg-slate-50/50 rounded-lg p-2 border border-slate-100 min-h-0">
              {stageDeals.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No deals
                </div>
              ) : (
                stageDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
