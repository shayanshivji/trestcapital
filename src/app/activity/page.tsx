"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarGroup } from "@/components/ui/avatar";
import { ActivityForm } from "@/components/forms/activity-form";
import { formatRelativeTime } from "@/lib/utils";
import { ACTIVITY_TYPE_CONFIG, Activity } from "@/types";
import {
  Plus, Phone, Video, Users, Mail, FileText, MessageSquare,
  Search, Clock, Pencil, Inbox,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, Video, Users, Mail, FileText, MessageSquare,
};

export default function ActivityPage() {
  const { activities } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activities.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.summary?.toLowerCase().includes(q) ?? false) ||
      (a.deal?.title.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="p-6 max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Feed</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Every call, meeting, email, and note in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => { setEditingActivity(undefined); setShowForm(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Log Activity
          </Button>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities by keyword, person, or deal..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Inbox className="h-8 w-8 mb-3" />
            <p className="text-sm font-medium">{search ? "No activities match your search" : "No activities logged yet"}</p>
            <p className="text-xs mt-1">{search ? "Try a different keyword" : "Log your first call, meeting, or email"}</p>
          </div>
        )}
        {filtered.map((activity) => {
          const config = ACTIVITY_TYPE_CONFIG[activity.activityType];
          const IconComponent = iconMap[config.icon];
          const isExpanded = expandedId === activity.id;
          return (
            <Card
              key={activity.id}
              hover
              className="relative cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : activity.id)}
            >
              <div className="flex gap-4">
                <div className={`h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 ${config.color}`}>
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-slate-900">{activity.title}</h3>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingActivity(activity);
                          setShowForm(true);
                        }}
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {activity.durationMin && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.durationMin}min
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatRelativeTime(activity.occurredAt)}
                      </span>
                    </div>
                  </div>

                  {activity.summary && (
                    <p className={`text-sm text-slate-600 mb-3 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                      {activity.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <Badge variant="default" size="sm">{config.label}</Badge>
                    {activity.deal && (
                      <Link
                        href={`/deals/${activity.dealId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:opacity-80"
                      >
                        <Badge variant="info" size="sm">{activity.deal.title}</Badge>
                      </Link>
                    )}
                    {activity.sentiment && (
                      <Badge
                        variant={
                          activity.sentiment === "positive" ? "success"
                            : activity.sentiment === "negative" ? "danger"
                              : "default"
                        }
                        size="sm"
                      >
                        {activity.sentiment}
                      </Badge>
                    )}
                    {activity.participants && activity.participants.length > 0 && (
                      <AvatarGroup people={activity.participants} max={4} />
                    )}
                  </div>

                  {isExpanded && activity.actionItems && activity.actionItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Action Items</p>
                      <ul className="space-y-1">
                        {activity.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <div className="h-4 w-4 rounded border border-slate-300 shrink-0 mt-0.5 flex items-center justify-center">
                              {item.done && <div className="h-2 w-2 rounded-sm bg-brand-600" />}
                            </div>
                            <span className={item.done ? "line-through text-slate-400" : ""}>
                              {item.text}
                              {item.assignee && <span className="text-slate-400">{" — "}{item.assignee}</span>}
                              {item.dueDate && (
                                <span className="text-slate-400">
                                  {" · due "}{new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ActivityForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingActivity(undefined); }}
        activity={editingActivity}
      />
    </div>
  );
}
