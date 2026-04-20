"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Company } from "@/types";
import { Modal, FormField, FormRow, FormActions, inputClass, selectClass, textareaClass } from "@/components/ui/modal";

interface CompanyFormProps {
  open: boolean;
  onClose: () => void;
  company?: Company;
}

export function CompanyForm({ open, onClose, company }: CompanyFormProps) {
  const { addCompany, updateCompany, sectors } = useData();
  const [name, setName] = useState(company?.name || "");
  const [codename, setCodename] = useState(company?.codename || "");
  const [description, setDescription] = useState(company?.description || "");
  const [sectorId, setSectorId] = useState(company?.sectorId || "");
  const [hqCity, setHqCity] = useState(company?.hqCity || "");
  const [hqState, setHqState] = useState(company?.hqState || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [revenue, setRevenue] = useState(company?.revenueMm?.toString() || "");
  const [ebitda, setEbitda] = useState(company?.ebitdaMm?.toString() || "");
  const [employees, setEmployees] = useState(company?.employeeCount?.toString() || "");
  const [yearFounded, setYearFounded] = useState(company?.yearFounded?.toString() || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name,
      codename: codename || undefined,
      description: description || undefined,
      sectorId: sectorId || undefined,
      sector: sectors.find((s) => s.id === sectorId),
      hqCity: hqCity || undefined,
      hqState: hqState || undefined,
      website: website || undefined,
      revenueMm: revenue ? parseFloat(revenue) : undefined,
      ebitdaMm: ebitda ? parseFloat(ebitda) : undefined,
      employeeCount: employees ? parseInt(employees) : undefined,
      yearFounded: yearFounded ? parseInt(yearFounded) : undefined,
    };
    if (company) {
      updateCompany(company.id, data);
    } else {
      addCompany(data);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={company ? "Edit Company" : "Add Company"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormRow>
          <FormField label="Company Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Atlas Automation Systems" />
          </FormField>
          <FormField label="Codename">
            <input className={inputClass} value={codename} onChange={(e) => setCodename(e.target.value)} placeholder="Project Atlas" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Sector">
            <select className={selectClass} value={sectorId} onChange={(e) => setSectorId(e.target.value)}>
              <option value="">Select sector...</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Website">
            <input className={inputClass} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="HQ City">
            <input className={inputClass} value={hqCity} onChange={(e) => setHqCity(e.target.value)} placeholder="New York" />
          </FormField>
          <FormField label="HQ State">
            <input className={inputClass} value={hqState} onChange={(e) => setHqState(e.target.value)} placeholder="NY" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Revenue ($M)">
            <input className={inputClass} type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="340" />
          </FormField>
          <FormField label="EBITDA ($M)">
            <input className={inputClass} type="number" value={ebitda} onChange={(e) => setEbitda(e.target.value)} placeholder="72" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Employees">
            <input className={inputClass} type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} placeholder="1200" />
          </FormField>
          <FormField label="Year Founded">
            <input className={inputClass} type="number" value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} placeholder="2008" />
          </FormField>
        </FormRow>
        <FormField label="Description">
          <textarea className={textareaClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does the company do?" />
        </FormField>
        <FormActions onCancel={onClose} submitLabel={company ? "Save Changes" : "Add Company"} />
      </form>
    </Modal>
  );
}
