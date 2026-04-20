"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ContactForm } from "@/components/forms/contact-form";
import { formatRelativeTime } from "@/lib/utils";
import {
  Plus, Search, Clock, ChevronRight, Users as UsersIcon,
} from "lucide-react";

const firmTypeBadge: Record<string, "info" | "success" | "warning" | "default"> = {
  pe_fund: "success",
  investment_bank: "info",
  advisory: "warning",
};

export default function ContactsPage() {
  const { contacts } = useData();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.firm?.name.toLowerCase().includes(q) ?? false) ||
      (c.title?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your relationship network across the PE ecosystem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts by name, firm, or title..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Firm</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Last Contact</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <UsersIcon className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-400">{search ? "No contacts match your search" : "No contacts yet"}</p>
                    <p className="text-xs text-slate-400 mt-1">{search ? "Try a different keyword" : "Add your first contact to get started"}</p>
                  </td>
                </tr>
              )}
              {filtered.map((contact) => (
                <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3 group">
                      <Avatar firstName={contact.firstName} lastName={contact.lastName} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.email && (
                          <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {contact.firm && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700 truncate">{contact.firm.name}</span>
                        <Badge variant={firmTypeBadge[contact.firm.firmType] || "default"} size="sm" className="shrink-0">
                          {contact.firm.firmType.replace("_", " ")}
                        </Badge>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600 truncate block max-w-[200px]">{contact.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    {contact.lastContactedAt && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3 w-3 shrink-0" />
                        {formatRelativeTime(contact.lastContactedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${contact.id}`} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors inline-flex">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ContactForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
