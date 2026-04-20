"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Contact } from "@/types";
import { Modal, FormField, FormRow, FormActions, inputClass, selectClass, textareaClass } from "@/components/ui/modal";

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  contact?: Contact;
}

export function ContactForm({ open, onClose, contact }: ContactFormProps) {
  const { addContact, updateContact, firms } = useData();
  const [firstName, setFirstName] = useState(contact?.firstName || "");
  const [lastName, setLastName] = useState(contact?.lastName || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [phone, setPhone] = useState(contact?.phone || "");
  const [title, setTitle] = useState(contact?.title || "");
  const [firmId, setFirmId] = useState(contact?.firmId || "");
  const [linkedin, setLinkedin] = useState(contact?.linkedinUrl || "");
  const [notes, setNotes] = useState(contact?.notes || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      firstName,
      lastName,
      email: email || undefined,
      phone: phone || undefined,
      title: title || undefined,
      firmId: firmId || undefined,
      firm: firms.find((f) => f.id === firmId),
      linkedinUrl: linkedin || undefined,
      notes: notes || undefined,
      isActive: true,
    };
    if (contact) {
      updateContact(contact.id, data);
    } else {
      addContact(data);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={contact ? "Edit Contact" : "Add Contact"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormRow>
          <FormField label="First Name">
            <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="James" />
          </FormField>
          <FormField label="Last Name">
            <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Chen" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Email">
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="james@firm.com" />
          </FormField>
          <FormField label="Phone">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(212) 555-0142" />
          </FormField>
        </FormRow>
        <FormField label="Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Managing Director, Industrials M&A" />
        </FormField>
        <FormField label="Firm">
          <select className={selectClass} value={firmId} onChange={(e) => setFirmId(e.target.value)}>
            <option value="">Select firm...</option>
            {firms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </FormField>
        <FormField label="LinkedIn">
          <input className={inputClass} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
        </FormField>
        <FormField label="Notes">
          <textarea className={textareaClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Relationship notes..." />
        </FormField>
        <FormActions onCancel={onClose} submitLabel={contact ? "Save Changes" : "Add Contact"} />
      </form>
    </Modal>
  );
}
