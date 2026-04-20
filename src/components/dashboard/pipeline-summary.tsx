"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/lib/data-context";
import { formatCurrency } from "@/lib/utils";
import { DEAL_STAGE_CONFIG, PIPELINE_STAGES } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function PipelineSummary() {
  const { deals } = useData();

  const stageData = PIPELINE_STAGES.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    const totalEv = stageDeals.reduce(
      (sum, d) => sum + (d.enterpriseValueMm || 0),
      0
    );
    return {
      stage,
      config: DEAL_STAGE_CONFIG[stage],
      deals: stageDeals,
      count: stageDeals.length,
      totalEv,
    };
  });

  const maxEv = Math.max(...stageData.map((s) => s.totalEv), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
        <Link
          href="/deals"
          className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
        >
          View pipeline <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <div className="space-y-3">
        {stageData.map(({ stage, config, deals: stageDeals, count, totalEv }) => (
          <div key={stage} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">{config.label}</span>
                {count > 0 && (
                  <Badge className={`${config.bgColor} ${config.color}`}>{count}</Badge>
                )}
              </div>
              {totalEv > 0 && (
                <span className="text-xs text-slate-500 font-medium">{formatCurrency(totalEv)}</span>
              )}
            </div>
            <div className="h-7 bg-slate-100 rounded-md overflow-hidden flex items-center relative">
              {totalEv > 0 && (
                <div
                  className={`h-full rounded-md transition-all duration-500 ${config.bgColor} opacity-60`}
                  style={{ width: `${Math.max((totalEv / maxEv) * 100, 8)}%` }}
                />
              )}
              <div className="absolute inset-0 flex items-center px-2 gap-1.5">
                {stageDeals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="hover:underline">
                    <span className="text-[11px] text-slate-600 font-medium truncate">
                      {deal.title}
                      {stageDeals.indexOf(deal) < stageDeals.length - 1 && (
                        <span className="text-slate-300 ml-1.5">·</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
