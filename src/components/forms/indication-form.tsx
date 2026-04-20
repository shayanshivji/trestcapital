"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Indication, IndicationSide } from "@/types";
import { Modal, FormField, FormRow, FormActions, inputClass, selectClass, textareaClass } from "@/components/ui/modal";

interface IndicationFormProps {
  open: boolean;
  onClose: () => void;
  indication?: Indication;
}

export function IndicationForm({ open, onClose, indication }: IndicationFormProps) {
  const { addIndication, updateIndication, firms, contacts, companies, sectors } = useData();
  const [side, setSide] = useState<IndicationSide>(indication?.side || "buy");
  const [firmId, setFirmId] = useState(indication?.firmId || "");
  const [contactId, setContactId] = useState(indication?.contactId || "");
  const [companyId, setCompanyId] = useState(indication?.companyId || "");
  const [sectorId, setSectorId] = useState(indication?.sectorId || "");
  const [sizeMin, setSizeMin] = useState(indication?.sizeMinMm?.toString() || "");
  const [sizeMax, setSizeMax] = useState(indication?.sizeMaxMm?.toString() || "");
  const [notes, setNotes] = useState(indication?.notes || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      side,
      firmId: firmId || undefined,
      firm: firms.find((f) => f.id === firmId),
      contactId: contactId || undefined,
      contact: contacts.find((c) => c.id === contactId),
      companyId: companyId || undefined,
      company: companies.find((c) => c.id === companyId),
      sectorId: sectorId || undefined,
      sector: sectors.find((s) => s.id === sectorId),
      sizeMinMm: sizeMin ? parseFloat(sizeMin) : undefined,
      sizeMaxMm: sizeMax ? parseFloat(sizeMax) : undefined,
      notes: notes || undefined,
      isActive: true,
      source: indication?.source || "manual" as const,
      confidence: 1.0,
      reviewed: true,
    };
    if (indication) {
      updateIndication(indication.id, data);
    } else {
      addIndication(data);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={indication ? "Edit Indication" : "Add Indication"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Side">
          <select className={selectClass} value={side} onChange={(e) => setSide(e.target.value as IndicationSide)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="both">Buy / Sell</option>
          </select>
        </FormField>
        <FormRow>
          <FormField label="Firm">
            <select className={selectClass} value={firmId} onChange={(e) => setFirmId(e.target.value)}>
              <option value="">Select firm...</option>
              {firms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </FormField>
          <FormField label="Contact">
            <select className={selectClass} value={contactId} onChange={(e) => setContactId(e.target.value)}>
              <option value="">Select contact...</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Company (specific)">
            <select className={selectClass} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">None</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Sector (broad)">
            <select className={selectClass} value={sectorId} onChange={(e) => setSectorId(e.target.value)}>
              <option value="">None</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Size Min ($M)">
            <input className={inputClass} type="number" value={sizeMin} onChange={(e) => setSizeMin(e.target.value)} placeholder="200" />
          </FormField>
          <FormField label="Size Max ($M)">
            <input className={inputClass} type="number" value={sizeMax} onChange={(e) => setSizeMax(e.target.value)} placeholder="600" />
          </FormField>
        </FormRow>
        <FormField label="Notes">
          <textarea className={textareaClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context on the indication..." />
        </FormField>
        <FormActions onCancel={onClose} submitLabel={indication ? "Save Changes" : "Add Indication"} />
      </form>
    </Modal>
  );
}
