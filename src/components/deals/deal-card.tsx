"use client";

import Link from "next/link";
import { Deal, DEAL_TYPE_LABELS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Building2, ChevronRight } from "lucide-react";

interface DealCardProps {
  deal: Deal;
}

const priorityColors: Record<number, string> = {
  1: "border-l-red-500",
  2: "border-l-amber-500",
  3: "border-l-blue-500",
  4: "border-l-slate-400",
  5: "border-l-slate-300",
};

export function DealCard({ deal }: DealCardProps) {
  return (
    <Link href={`/deals/${deal.id}`}>
      <div
        className={`group bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer border-l-[3px] ${
          priorityColors[deal.priority] || "border-l-slate-300"
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
            {deal.title}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {deal.enterpriseValueMm && (
              <span className="text-xs font-bold text-slate-900">
                {formatCurrency(deal.enterpriseValueMm)}
              </span>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-500 transition-colors" />
          </div>
        </div>

        {deal.company && (
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-600">{deal.company.name}</span>
          </div>
        )}

        {deal.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-2">
            {deal.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {deal.dealType && (
              <Badge variant="outline" size="sm">
                {DEAL_TYPE_LABELS[deal.dealType]}
              </Badge>
            )}
            {deal.sourceFirm && (
              <Badge variant="default" size="sm">
                {deal.sourceFirm.name}
              </Badge>
            )}
          </div>
          {deal.expectedCloseDate && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              {new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
