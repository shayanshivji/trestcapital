"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Deal, Company, Contact, Firm, Activity, Indication, Sector,
  DealDocument, DealContactLink,
} from "@/types";
import {
  deals as initialDeals,
  companies as initialCompanies,
  contacts as initialContacts,
  firms as initialFirms,
  activities as initialActivities,
  indications as initialIndications,
  sectors as initialSectors,
} from "@/lib/mock-data";

interface DataContextType {
  deals: Deal[];
  companies: Company[];
  contacts: Contact[];
  firms: Firm[];
  activities: Activity[];
  indications: Indication[];
  sectors: Sector[];

  getDeal: (id: string) => Deal | undefined;
  getCompany: (id: string) => Company | undefined;
  getContact: (id: string) => Contact | undefined;
  getFirm: (id: string) => Firm | undefined;

  addDeal: (deal: Omit<Deal, "id" | "createdAt" | "updatedAt">) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;

  addCompany: (company: Omit<Company, "id">) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  addContact: (contact: Omit<Contact, "id">) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => Activity;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  addIndication: (indication: Omit<Indication, "id" | "createdAt">) => Indication;
  updateIndication: (id: string, updates: Partial<Indication>) => void;
  deleteIndication: (id: string) => void;
  reviewIndication: (id: string) => void;

  documents: DealDocument[];
  getDocumentsForDeal: (dealId: string) => DealDocument[];
  addDocument: (doc: Omit<DealDocument, "id" | "uploadedAt">) => DealDocument;
  deleteDocument: (id: string) => void;

  dealContacts: DealContactLink[];
  getContactsForDeal: (dealId: string) => (DealContactLink & { contact?: Contact })[];
  linkContactToDeal: (dealId: string, contactId: string, role: string) => void;
  unlinkContactFromDeal: (dealId: string, contactId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

let nextId = 100;
function genId(prefix: string) {
  return `${prefix}${nextId++}`;
}

function now() {
  return new Date().toISOString();
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [firms] = useState<Firm[]>(initialFirms);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [indications, setIndications] = useState<Indication[]>(initialIndications);
  const [sectors] = useState<Sector[]>(initialSectors);
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [dealContacts, setDealContacts] = useState<DealContactLink[]>([
    { dealId: "d1", contactId: "c1", role: "Sell-side Advisor" },
    { dealId: "d1", contactId: "c4", role: "Company CEO" },
    { dealId: "d3", contactId: "c2", role: "Co-Investor" },
    { dealId: "d5", contactId: "c6", role: "Sell-side Advisor" },
    { dealId: "d7", contactId: "c8", role: "Advisor" },
  ]);

  const getDeal = useCallback((id: string) => deals.find((d) => d.id === id), [deals]);
  const getCompany = useCallback((id: string) => companies.find((c) => c.id === id), [companies]);
  const getContact = useCallback((id: string) => contacts.find((c) => c.id === id), [contacts]);
  const getFirm = useCallback((id: string) => firms.find((f) => f.id === id), [firms]);

  const addDeal = useCallback((data: Omit<Deal, "id" | "createdAt" | "updatedAt">) => {
    const deal: Deal = { ...data, id: genId("d"), createdAt: now(), updatedAt: now() };
    setDeals((prev) => [deal, ...prev]);
    return deal;
  }, []);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals((prev) => prev.map((d) => d.id === id ? { ...d, ...updates, updatedAt: now() } : d));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addCompany = useCallback((data: Omit<Company, "id">) => {
    const company: Company = { ...data, id: genId("co") };
    setCompanies((prev) => [company, ...prev]);
    return company;
  }, []);

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addContact = useCallback((data: Omit<Contact, "id">) => {
    const contact: Contact = { ...data, id: genId("c") };
    setContacts((prev) => [contact, ...prev]);
    return contact;
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addActivity = useCallback((data: Omit<Activity, "id" | "createdAt">) => {
    const activity: Activity = { ...data, id: genId("a"), createdAt: now() };
    setActivities((prev) => [activity, ...prev]);
    return activity;
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities((prev) => prev.map((a) => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addIndication = useCallback((data: Omit<Indication, "id" | "createdAt">) => {
    const indication: Indication = { ...data, id: genId("i"), createdAt: now() };
    setIndications((prev) => [indication, ...prev]);
    return indication;
  }, []);

  const updateIndication = useCallback((id: string, updates: Partial<Indication>) => {
    setIndications((prev) => prev.map((i) => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const deleteIndication = useCallback((id: string) => {
    setIndications((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const reviewIndication = useCallback((id: string) => {
    setIndications((prev) => prev.map((i) => i.id === id ? { ...i, reviewed: true } : i));
  }, []);

  const getDocumentsForDeal = useCallback(
    (dealId: string) => documents.filter((d) => d.dealId === dealId),
    [documents]
  );

  const addDocument = useCallback((data: Omit<DealDocument, "id" | "uploadedAt">) => {
    const doc: DealDocument = { ...data, id: genId("doc"), uploadedAt: now() };
    setDocuments((prev) => [doc, ...prev]);
    return doc;
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const getContactsForDeal = useCallback(
    (dealId: string) =>
      dealContacts
        .filter((dc) => dc.dealId === dealId)
        .map((dc) => ({ ...dc, contact: contacts.find((c) => c.id === dc.contactId) })),
    [dealContacts, contacts]
  );

  const linkContactToDeal = useCallback((dealId: string, contactId: string, role: string) => {
    setDealContacts((prev) => {
      if (prev.some((dc) => dc.dealId === dealId && dc.contactId === contactId)) return prev;
      return [...prev, { dealId, contactId, role }];
    });
  }, []);

  const unlinkContactFromDeal = useCallback((dealId: string, contactId: string) => {
    setDealContacts((prev) => prev.filter((dc) => !(dc.dealId === dealId && dc.contactId === contactId)));
  }, []);

  return (
    <DataContext.Provider
      value={{
        deals, companies, contacts, firms, activities, indications, sectors,
        getDeal, getCompany, getContact, getFirm,
        addDeal, updateDeal, deleteDeal,
        addCompany, updateCompany, deleteCompany,
        addContact, updateContact, deleteContact,
        addActivity, updateActivity, deleteActivity,
        addIndication, updateIndication, deleteIndication, reviewIndication,
        documents, getDocumentsForDeal, addDocument, deleteDocument,
        dealContacts, getContactsForDeal, linkContactToDeal, unlinkContactFromDeal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
