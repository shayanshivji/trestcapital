"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarGroup } from "@/components/ui/avatar";
import { useData } from "@/lib/data-context";
import { formatRelativeTime } from "@/lib/utils";
import { ACTIVITY_TYPE_CONFIG } from "@/types";
import {
  Phone, Video, Users, Mail, FileText, MessageSquare, ArrowRight, ChevronRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, Video, Users, Mail, FileText, MessageSquare,
};

export function RecentActivity() {
  const { activities } = useData();
  const recentActivities = activities.slice(0, 7);

  return (
    <Card padding="none" className="flex flex-col h-full">
      <CardHeader className="px-4 pt-4 pb-0 mb-3">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/activity" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1">
        {recentActivities.map((activity) => {
          const config = ACTIVITY_TYPE_CONFIG[activity.activityType];
          const IconComponent = iconMap[config.icon];
          const linkHref = activity.dealId ? `/deals/${activity.dealId}` : "/activity";
          return (
            <Link
              key={activity.id}
              href={linkHref}
              className="flex gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg mx-1 cursor-pointer transition-colors group"
            >
              <div className={`h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 ${config.color}`}>
                {IconComponent && <IconComponent className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 font-medium truncate group-hover:text-brand-600 transition-colors">{activity.title}</p>
                {activity.summary && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{activity.summary}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  {activity.deal && (
                    <Badge variant="info" size="sm">{activity.deal.title}</Badge>
                  )}
                  {activity.participants && activity.participants.length > 0 && (
                    <AvatarGroup people={activity.participants} max={3} />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[11px] text-slate-400 whitespace-nowrap pt-0.5">
                  {formatRelativeTime(activity.occurredAt)}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-500 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
