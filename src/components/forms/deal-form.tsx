"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Deal, DealStage, DealType, DEAL_TYPE_LABELS, DEAL_STAGE_CONFIG, PIPELINE_STAGES } from "@/types";
import { Modal, FormField, FormRow, FormActions, inputClass, selectClass, textareaClass } from "@/components/ui/modal";

interface DealFormProps {
  open: boolean;
  onClose: () => void;
  deal?: Deal;
}

const allStages: DealStage[] = [...PIPELINE_STAGES, "closed_won", "passed", "dead"];
const dealTypes: DealType[] = [
  "platform", "bolt_on", "co_invest", "secondary_direct", "secondary_fund",
  "secondary_structured", "gp_led", "tender_offer", "recapitalization", "growth_equity",
];

export function DealForm({ open, onClose, deal }: DealFormProps) {
  const { addDeal, updateDeal, companies, firms, contacts } = useData();
  const [title, setTitle] = useState(deal?.title || "");
  const [companyId, setCompanyId] = useState(deal?.companyId || "");
  const [stage, setStage] = useState<DealStage>(deal?.stage || "sourced");
  const [dealType, setDealType] = useState<DealType | "">(deal?.dealType || "");
  const [ev, setEv] = useState(deal?.enterpriseValueMm?.toString() || "");
  const [equity, setEquity] = useState(deal?.equityCheckMm?.toString() || "");
  const [sourceFirmId, setSourceFirmId] = useState(deal?.sourceFirmId || "");
  const [sourceContactId, setSourceContactId] = useState(deal?.sourceContactId || "");
  const [description, setDescription] = useState(deal?.description || "");
  const [thesis, setThesis] = useState(deal?.thesis || "");
  const [priority, setPriority] = useState(deal?.priority?.toString() || "3");
  const [closeDate, setCloseDate] = useState(deal?.expectedCloseDate || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title,
      companyId: companyId || undefined,
      company: companies.find((c) => c.id === companyId),
      stage,
      dealType: (dealType as DealType) || undefined,
      enterpriseValueMm: ev ? parseFloat(ev) : undefined,
      equityCheckMm: equity ? parseFloat(equity) : undefined,
      sourceFirmId: sourceFirmId || undefined,
      sourceFirm: firms.find((f) => f.id === sourceFirmId),
      sourceContactId: sourceContactId || undefined,
      sourceContact: contacts.find((c) => c.id === sourceContactId),
      description,
      thesis,
      priority: parseInt(priority),
      expectedCloseDate: closeDate || undefined,
    };
    if (deal) {
      updateDeal(deal.id, data);
    } else {
      addDeal(data);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={deal ? "Edit Deal" : "New Deal"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Deal Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Project Atlas" />
        </FormField>
        <FormRow>
          <FormField label="Company">
            <select className={selectClass} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">Select company...</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Deal Type">
            <select className={selectClass} value={dealType} onChange={(e) => setDealType(e.target.value as DealType)}>
              <option value="">Select type...</option>
              {dealTypes.map((t) => <option key={t} value={t}>{DEAL_TYPE_LABELS[t]}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Stage">
            <select className={selectClass} value={stage} onChange={(e) => setStage(e.target.value as DealStage)}>
              {allStages.map((s) => <option key={s} value={s}>{DEAL_STAGE_CONFIG[s].label}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select className={selectClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="1">P1 — Critical</option>
              <option value="2">P2 — High</option>
              <option value="3">P3 — Medium</option>
              <option value="4">P4 — Low</option>
              <option value="5">P5 — Minimal</option>
            </select>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Enterprise Value ($M)">
            <input className={inputClass} type="number" value={ev} onChange={(e) => setEv(e.target.value)} placeholder="850" />
          </FormField>
          <FormField label="Equity Check ($M)">
            <input className={inputClass} type="number" value={equity} onChange={(e) => setEquity(e.target.value)} placeholder="425" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Source Firm">
            <select className={selectClass} value={sourceFirmId} onChange={(e) => setSourceFirmId(e.target.value)}>
              <option value="">Select firm...</option>
              {firms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </FormField>
          <FormField label="Source Contact">
            <select className={selectClass} value={sourceContactId} onChange={(e) => setSourceContactId(e.target.value)}>
              <option value="">Select contact...</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormField label="Expected Close">
          <input className={inputClass} type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
        </FormField>
        <FormField label="Description">
          <textarea className={textareaClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deal context and background..." />
        </FormField>
        <FormField label="Investment Thesis">
          <textarea className={textareaClass} value={thesis} onChange={(e) => setThesis(e.target.value)} placeholder="Why this deal is compelling..." />
        </FormField>
        <FormActions onCancel={onClose} submitLabel={deal ? "Save Changes" : "Create Deal"} />
      </form>
    </Modal>
  );
}
