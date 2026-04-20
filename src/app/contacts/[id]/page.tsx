"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/forms/contact-form";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import { DEAL_STAGE_CONFIG, ACTIVITY_TYPE_CONFIG } from "@/types";
import { useState } from "react";
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone, Linkedin, Briefcase,
  Video, Users, FileText, MessageSquare, Clock, MapPin,
} from "lucide-react";

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, Video, Users, Mail, FileText, MessageSquare,
};

const firmTypeBadge: Record<string, "info" | "success" | "warning" | "default"> = {
  pe_fund: "success",
  investment_bank: "info",
  advisory: "warning",
};

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getContact, deals, activities, indications, deleteContact } = useData();
  const [editing, setEditing] = useState(false);

  const contact = getContact(id);
  if (!contact) {
    return (
      <div className="p-6">
        <Link href="/contacts" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 font-medium mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Contacts
        </Link>
        <p className="text-slate-500">Contact not found.</p>
      </div>
    );
  }

  const contactDeals = deals.filter(
    (d) => d.sourceContactId === contact.id
  );
  const contactActivities = activities
    .filter((a) => a.participants?.some((p) => p.id === contact.id))
    .slice(0, 10);
  const contactIndications = indications.filter(
    (i) => i.contactId === contact.id
  );

  function handleDelete() {
    if (!contact) return;
    if (confirm("Delete this contact? This cannot be undone.")) {
      deleteContact(contact.id);
      router.push("/contacts");
    }
  }

  return (
    <div className="p-6 max-w-[1200px]">
      <div className="mb-6">
        <Link href="/contacts" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 font-medium mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Contacts
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar firstName={contact.firstName} lastName={contact.lastName} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {contact.firstName} {contact.lastName}
              </h1>
              {contact.title && (
                <p className="text-sm text-slate-500 mt-0.5">{contact.title}</p>
              )}
              {contact.firm && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-slate-700">{contact.firm.name}</span>
                  <Badge variant={firmTypeBadge[contact.firm.firmType] || "default"} size="sm">
                    {contact.firm.firmType.replace("_", " ")}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <button onClick={handleDelete} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sourced Deals */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle>Sourced Deals ({contactDeals.length})</CardTitle>
            </CardHeader>
            {contactDeals.length === 0 ? (
              <div className="px-4 pb-4 text-sm text-slate-400">No deals sourced from this contact.</div>
            ) : (
              <div>
                {contactDeals.map((deal) => {
                  const stageConfig = DEAL_STAGE_CONFIG[deal.stage];
                  return (
                    <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-slate-900">{deal.title}</span>
                          <Badge className={`${stageConfig.bgColor} ${stageConfig.color}`} size="sm">{stageConfig.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {deal.company && <span>{deal.company.name}</span>}
                          {deal.enterpriseValueMm && <span>{formatCurrency(deal.enterpriseValueMm)} EV</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Activity With This Contact */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle>Activity History</CardTitle>
              <span className="text-xs text-slate-400">{contactActivities.length} interactions</span>
            </CardHeader>
            {contactActivities.length === 0 ? (
              <div className="px-4 pb-4 text-sm text-slate-400">No logged activity with this contact.</div>
            ) : (
              <div>
                {contactActivities.map((activity) => {
                  const config = ACTIVITY_TYPE_CONFIG[activity.activityType];
                  const IconComponent = activityIcons[config.icon];
                  return (
                    <div key={activity.id} className="px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <div className="flex gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 ${config.color}`}>
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-slate-900">{activity.title}</h4>
                            <span className="text-[11px] text-slate-400 shrink-0 ml-2">{formatRelativeTime(activity.occurredAt)}</span>
                          </div>
                          {activity.summary && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{activity.summary}</p>}
                          {activity.deal && (
                            <Badge variant="info" size="sm" className="mt-1">{activity.deal.title}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Indications */}
          {contactIndications.length > 0 && (
            <Card padding="none">
              <CardHeader className="px-4 pt-4 pb-0 mb-3">
                <CardTitle>Indications ({contactIndications.length})</CardTitle>
              </CardHeader>
              <div>
                {contactIndications.map((ind) => (
                  <div key={ind.id} className="px-4 py-3 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={ind.side === "buy" ? "success" : ind.side === "sell" ? "danger" : "warning"} size="sm">
                        {ind.side.toUpperCase()}
                      </Badge>
                      {ind.company && <span className="text-sm font-medium text-slate-900">{ind.company.name}</span>}
                      {ind.sector && <span className="text-sm text-slate-500">{ind.sector.name}</span>}
                    </div>
                    {ind.notes && <p className="text-xs text-slate-500">{ind.notes}</p>}
                    {(ind.sizeMinMm || ind.sizeMaxMm) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ind.sizeMinMm && ind.sizeMaxMm
                          ? `${formatCurrency(ind.sizeMinMm)} – ${formatCurrency(ind.sizeMaxMm)}`
                          : ind.sizeMinMm ? `${formatCurrency(ind.sizeMinMm)}+` : `Up to ${formatCurrency(ind.sizeMaxMm!)}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="mb-3"><CardTitle>Contact Info</CardTitle></CardHeader>
            <div className="space-y-3">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-brand-600 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center"><Mail className="h-4 w-4 text-slate-400" /></div>
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-brand-600 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center"><Phone className="h-4 w-4 text-slate-400" /></div>
                  {contact.phone}
                </a>
              )}
              {contact.linkedinUrl && (
                <a href={contact.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-slate-700 hover:text-brand-600 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center"><Linkedin className="h-4 w-4 text-slate-400" /></div>
                  LinkedIn Profile
                </a>
              )}
            </div>
          </Card>

          {contact.firm && (
            <Card>
              <CardHeader className="mb-3"><CardTitle>Firm</CardTitle></CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{contact.firm.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{contact.firm.firmType.replace("_", " ")}</p>
                </div>
              </div>
              {contact.firm.hqCity && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" /> {contact.firm.hqCity}, {contact.firm.hqState}
                </div>
              )}
            </Card>
          )}

          <Card>
            <CardHeader className="mb-3"><CardTitle>Relationship</CardTitle></CardHeader>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <Badge variant={contact.isActive ? "success" : "default"} size="sm">
                  {contact.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {contact.lastContactedAt && (
                <>
                  <hr className="border-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Contacted</span>
                    <span className="font-medium text-slate-900">{formatRelativeTime(contact.lastContactedAt)}</span>
                  </div>
                </>
              )}
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Deals Sourced</span>
                <span className="font-medium text-slate-900">{contactDeals.length}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Interactions</span>
                <span className="font-medium text-slate-900">{contactActivities.length}</span>
              </div>
            </div>
          </Card>

          {contact.notes && (
            <Card>
              <CardHeader className="mb-3"><CardTitle>Notes</CardTitle></CardHeader>
              <p className="text-sm text-slate-600 leading-relaxed">{contact.notes}</p>
            </Card>
          )}
        </div>
      </div>

      <ContactForm open={editing} onClose={() => setEditing(false)} contact={contact} />
    </div>
  );
}
