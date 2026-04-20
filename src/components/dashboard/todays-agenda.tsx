"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { todaysAgenda } from "@/lib/mock-data";
import { ACTIVITY_TYPE_CONFIG } from "@/types";
import { Phone, Video, Users, Calendar } from "lucide-react";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  phone_call: Phone,
  video_meeting: Video,
  in_person_meeting: Users,
};

export function TodaysAgenda() {
  return (
    <Card padding="none" className="flex flex-col h-full">
      <CardHeader className="px-4 pt-4 pb-0 mb-3">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          Today&apos;s Agenda
        </CardTitle>
        <span className="text-xs text-slate-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </CardHeader>
      <div className="flex-1 px-4 pb-4 space-y-1">
        {todaysAgenda.map((item, i) => {
          const Icon = typeIcons[item.type] || Video;
          const config = ACTIVITY_TYPE_CONFIG[item.type];
          return (
            <div
              key={i}
              className="flex gap-3 py-2.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <div className="text-xs text-slate-400 font-medium w-16 shrink-0 pt-0.5">
                {item.time}
              </div>
              <div
                className={`h-6 w-6 rounded-md bg-slate-50 flex items-center justify-center shrink-0 ${config.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 font-medium truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {item.deal && (
                    <Badge variant="info" size="sm">
                      {item.deal}
                    </Badge>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {item.participants.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
