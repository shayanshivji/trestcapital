"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Activity, ActivityType, ACTIVITY_TYPE_CONFIG } from "@/types";
import { Modal, FormField, FormRow, FormActions, inputClass, selectClass, textareaClass } from "@/components/ui/modal";

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  activity?: Activity;
}

const activityTypes: ActivityType[] = [
  "phone_call", "video_meeting", "in_person_meeting", "email", "internal_note", "slack_message",
];

export function ActivityForm({ open, onClose, activity }: ActivityFormProps) {
  const { addActivity, updateActivity, deals, companies, contacts } = useData();
  const [activityType, setActivityType] = useState<ActivityType>(activity?.activityType || "phone_call");
  const [title, setTitle] = useState(activity?.title || "");
  const [summary, setSummary] = useState(activity?.summary || "");
  const [dealId, setDealId] = useState(activity?.dealId || "");
  const [companyId, setCompanyId] = useState(activity?.companyId || "");
  const [duration, setDuration] = useState(activity?.durationMin?.toString() || "");
  const [sentiment, setSentiment] = useState(activity?.sentiment || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      activityType,
      title,
      summary: summary || undefined,
      dealId: dealId || undefined,
      deal: deals.find((d) => d.id === dealId),
      companyId: companyId || undefined,
      company: companies.find((c) => c.id === companyId),
      occurredAt: activity?.occurredAt || new Date().toISOString(),
      durationMin: duration ? parseInt(duration) : undefined,
      sentiment: (sentiment as "positive" | "neutral" | "negative") || undefined,
      participants: [],
    };
    if (activity) {
      updateActivity(activity.id, data);
    } else {
      addActivity(data);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={activity ? "Edit Activity" : "Log Activity"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormRow>
          <FormField label="Type">
            <select className={selectClass} value={activityType} onChange={(e) => setActivityType(e.target.value as ActivityType)}>
              {activityTypes.map((t) => <option key={t} value={t}>{ACTIVITY_TYPE_CONFIG[t].label}</option>)}
            </select>
          </FormField>
          <FormField label="Duration (min)">
            <input className={inputClass} type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" />
          </FormField>
        </FormRow>
        <FormField label="Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Call with James Chen (GS) — Project Atlas" />
        </FormField>
        <FormRow>
          <FormField label="Deal">
            <select className={selectClass} value={dealId} onChange={(e) => setDealId(e.target.value)}>
              <option value="">None</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </FormField>
          <FormField label="Company">
            <select className={selectClass} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">None</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormField label="Sentiment">
          <select className={selectClass} value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
            <option value="">No sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </FormField>
        <FormField label="Summary / Notes">
          <textarea className={textareaClass} rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Key takeaways from the interaction..." />
        </FormField>
        <FormActions onCancel={onClose} submitLabel={activity ? "Save Changes" : "Log Activity"} />
      </form>
    </Modal>
  );
}
