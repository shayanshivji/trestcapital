"use client";

import { Card } from "@/components/ui/card";
import { useData } from "@/lib/data-context";
import { formatCurrency } from "@/lib/utils";
import { GitBranch, DollarSign, FileSearch, TrendingUp } from "lucide-react";

export function StatsCards() {
  const { deals, indications, activities } = useData();

  const activeDeals = deals.filter(
    (d) => !["closed_won", "passed", "dead"].includes(d.stage)
  );
  const totalPipelineValue = activeDeals.reduce(
    (sum, d) => sum + (d.enterpriseValueMm || 0),
    0
  );
  const dealsInDD = deals.filter((d) => d.stage === "due_diligence").length;
  const dealsInLOI = deals.filter(
    (d) => d.stage === "loi_bid" || d.stage === "exclusivity"
  ).length;
  const activeIndications = indications.filter((i) => i.isActive).length;

  const stats = [
    {
      label: "Active Deals",
      value: activeDeals.length.toString(),
      change: "+2 this month",
      icon: GitBranch,
      iconBg: "bg-brand-100",
      iconColor: "text-brand-500",
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(totalPipelineValue),
      change: "Across all stages",
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "In Diligence",
      value: dealsInDD.toString(),
      change: `${dealsInLOI} at LOI+`,
      icon: FileSearch,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      label: "Active Indications",
      value: activeIndications.toString(),
      change: `${activities.length} total activities`,
      icon: TrendingUp,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
            </div>
            <div className={`h-10 w-10 rounded-lg ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
