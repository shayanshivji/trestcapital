"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CompanyForm } from "@/components/forms/company-form";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { DEAL_STAGE_CONFIG, DEAL_TYPE_LABELS, ACTIVITY_TYPE_CONFIG } from "@/types";
import { useState } from "react";
import {
  ArrowLeft, Building2, MapPin, Globe, Users,
  Pencil, Trash2, Phone, Video, Mail, FileText, MessageSquare,
  Clock, Briefcase,
} from "lucide-react";

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, Video, Users, Mail, FileText, MessageSquare,
};

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getCompany, deals, activities, contacts, deleteCompany } = useData();
  const [editing, setEditing] = useState(false);

  const company = getCompany(id);
  if (!company) {
    return (
      <div className="p-6">
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 font-medium mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Companies
        </Link>
        <p className="text-slate-500">Company not found.</p>
      </div>
    );
  }

  const companyDeals = deals.filter((d) => d.companyId === company.id);
  const companyActivities = activities.filter((a) => a.companyId === company.id).slice(0, 10);
  const companyContacts = contacts.filter((c) =>
    c.firmId === company.ownerFirmId ||
    companyDeals.some((d) => d.sourceContactId === c.id)
  );

  function handleDelete() {
    if (!company) return;
    if (confirm("Delete this company? This cannot be undone.")) {
      deleteCompany(company.id);
      router.push("/companies");
    }
  }

  return (
    <div className="p-6 max-w-[1200px]">
      <div className="mb-6">
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 font-medium mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Companies
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
              {company.sector && <Badge variant="outline">{company.sector.name}</Badge>}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              {company.codename && (
                <span className="text-brand-600 font-medium">{company.codename}</span>
              )}
              {company.hqCity && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {company.hqCity}, {company.hqState}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" /> {company.website}
                </a>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <Card>
          <p className="text-sm text-slate-500 font-medium">Revenue</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {company.revenueMm ? formatCurrency(company.revenueMm) : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 font-medium">EBITDA</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {company.ebitdaMm ? formatCurrency(company.ebitdaMm) : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 font-medium">EBITDA Margin</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {company.revenueMm && company.ebitdaMm
              ? `${((company.ebitdaMm / company.revenueMm) * 100).toFixed(1)}%`
              : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 font-medium">Employees</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {company.employeeCount ? company.employeeCount.toLocaleString() : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 font-medium">Founded</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {company.yearFounded || "—"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {company.description && (
            <Card>
              <CardHeader className="mb-3"><CardTitle>Overview</CardTitle></CardHeader>
              <p className="text-sm text-slate-700 leading-relaxed">{company.description}</p>
            </Card>
          )}

          {/* Related Deals */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle>Deals ({companyDeals.length})</CardTitle>
            </CardHeader>
            {companyDeals.length === 0 ? (
              <div className="px-4 pb-4 text-sm text-slate-400">No deals linked to this company.</div>
            ) : (
              <div>
                {companyDeals.map((deal) => {
                  const stageConfig = DEAL_STAGE_CONFIG[deal.stage];
                  return (
                    <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-slate-900">{deal.title}</span>
                          <Badge className={`${stageConfig.bgColor} ${stageConfig.color}`} size="sm">{stageConfig.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {deal.dealType && <span>{DEAL_TYPE_LABELS[deal.dealType]}</span>}
                          {deal.enterpriseValueMm && <span>{formatCurrency(deal.enterpriseValueMm)} EV</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Activity Timeline */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle>Recent Activity</CardTitle>
              <span className="text-xs text-slate-400">{companyActivities.length} entries</span>
            </CardHeader>
            {companyActivities.length === 0 ? (
              <div className="px-4 pb-4 text-sm text-slate-400">No activity yet.</div>
            ) : (
              <div>
                {companyActivities.map((activity) => {
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {company.ownerFirm && (
            <Card>
              <CardHeader className="mb-3"><CardTitle>Current Owner</CardTitle></CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{company.ownerFirm.name}</p>
                  <p className="text-xs text-slate-400">{company.ownerFirm.firmType.replace("_", " ")}</p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader className="mb-3"><CardTitle>Company Details</CardTitle></CardHeader>
            <div className="space-y-2.5 text-sm">
              {company.hqCity && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Headquarters</span>
                  <span className="font-medium text-slate-900">{company.hqCity}, {company.hqState}</span>
                </div>
              )}
              {company.sector && (
                <>
                  <hr className="border-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sector</span>
                    <span className="font-medium text-slate-900">{company.sector.name}</span>
                  </div>
                </>
              )}
              {company.yearFounded && (
                <>
                  <hr className="border-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Year Founded</span>
                    <span className="font-medium text-slate-900">{company.yearFounded}</span>
                  </div>
                </>
              )}
              {company.employeeCount && (
                <>
                  <hr className="border-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Headcount</span>
                    <span className="font-medium text-slate-900">{company.employeeCount.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <CompanyForm open={editing} onClose={() => setEditing(false)} company={company} />
    </div>
  );
}
