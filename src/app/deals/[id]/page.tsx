"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { DEAL_STAGE_CONFIG, ACTIVITY_TYPE_CONFIG, PIPELINE_STAGES, DEAL_TYPE_LABELS, DOC_CATEGORY_LABELS, DocCategory } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal, FormField, FormRow, FormActions, inputClass, selectClass } from "@/components/ui/modal";
import { DealForm } from "@/components/forms/deal-form";
import { ActivityForm } from "@/components/forms/activity-form";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft, Building2, Clock, FileText, Mail, MapPin,
  MessageSquare, Phone, Plus, Users, Video, Briefcase, CheckCircle2,
  AlertCircle, Pencil, Trash2, Upload, File, X, UserPlus,
} from "lucide-react";

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, Video, Users, Mail, FileText, MessageSquare,
};

const priorityConfig: Record<number, { label: string; variant: "danger" | "warning" | "info" | "default" }> = {
  1: { label: "Critical", variant: "danger" },
  2: { label: "High", variant: "warning" },
  3: { label: "Medium", variant: "info" },
  4: { label: "Low", variant: "default" },
  5: { label: "Minimal", variant: "default" },
};

const docCategoryIcons: Record<DocCategory, string> = {
  model: "text-emerald-600 bg-emerald-50",
  presentation: "text-blue-600 bg-blue-50",
  memo: "text-violet-600 bg-violet-50",
  legal: "text-amber-600 bg-amber-50",
  diligence: "text-cyan-600 bg-cyan-50",
  other: "text-slate-600 bg-slate-50",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    getDeal, activities, indications, contacts, deleteDeal,
    getDocumentsForDeal, addDocument, deleteDocument,
    getContactsForDeal, linkContactToDeal, unlinkContactFromDeal,
  } = useData();
  const [editing, setEditing] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showLinkContact, setShowLinkContact] = useState(false);

  const deal = getDeal(id);

  if (!deal) {
    return (
      <div className="p-6">
        <Link href="/deals" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 font-medium mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Pipeline
        </Link>
        <p className="text-slate-500">Deal not found.</p>
      </div>
    );
  }

  const dealActivities = activities.filter((a) => a.dealId === deal.id);
  const dealIndications = indications.filter((i) => i.companyId === deal.companyId);
  const dealDocs = getDocumentsForDeal(deal.id);
  const dealContactLinks = getContactsForDeal(deal.id);
  const company = deal.company;
  const stageConfig = DEAL_STAGE_CONFIG[deal.stage];
  const pConfig = priorityConfig[deal.priority] || priorityConfig[3];
  const currentStageIndex = PIPELINE_STAGES.indexOf(deal.stage);

  function handleDelete() {
    if (!deal) return;
    if (confirm("Delete this deal? This cannot be undone.")) {
      deleteDeal(deal.id);
      router.push("/deals");
    }
  }

  return (
    <div className="p-6 max-w-[1200px]">
      <div className="mb-6">
        <Link href="/deals" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 font-medium mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Pipeline
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{deal.title}</h1>
              <Badge variant={pConfig.variant} size="md">{pConfig.label} Priority</Badge>
            </div>
            {company && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <Link href={`/companies/${company.id}`} className="hover:text-brand-600 transition-colors">{company.name}</Link>
                {company.hqCity && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.hqCity}, {company.hqState}</span>
                  </>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowActivityForm(true)}>
              <Phone className="h-3.5 w-3.5" /> Log Call
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <button onClick={handleDelete} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stage Progress */}
      <Card className="mb-4">
        <div className="flex items-center gap-1">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isActive = stage === deal.stage;
            const isPast = idx < currentStageIndex;
            const sConfig = DEAL_STAGE_CONFIG[stage];
            return (
              <div key={stage} className="flex-1">
                <div className={`h-2 rounded-full transition-colors ${isPast ? "bg-brand-600" : isActive ? "bg-brand-400" : "bg-slate-100"}`} />
                <p className={`text-[10px] font-medium mt-1.5 text-center ${isActive ? "text-brand-600" : isPast ? "text-slate-700" : "text-slate-300"}`}>{sConfig.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <Card>
          <p className="text-sm text-slate-500 font-medium">Enterprise Value</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{deal.enterpriseValueMm ? formatCurrency(deal.enterpriseValueMm) : "TBD"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 font-medium">Equity Check</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{deal.equityCheckMm ? formatCurrency(deal.equityCheckMm) : "TBD"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 font-medium">Deal Type</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{deal.dealType ? DEAL_TYPE_LABELS[deal.dealType] : "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 font-medium">Stage</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{stageConfig.label}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 font-medium">Expected Close</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "TBD"}
          </p>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          {/* Thesis */}
          {deal.thesis && (
            <Card>
              <CardHeader className="mb-3"><CardTitle>Investment Thesis</CardTitle></CardHeader>
              <p className="text-sm text-slate-700 leading-relaxed">{deal.thesis}</p>
              {deal.description && (
                <><hr className="my-3 border-slate-100" /><p className="text-sm text-slate-500 leading-relaxed">{deal.description}</p></>
              )}
            </Card>
          )}

          {/* Company Profile */}
          {company && (
            <Card>
              <CardHeader className="mb-3">
                <CardTitle><Link href={`/companies/${company.id}`} className="hover:text-brand-600 transition-colors">Company Profile</Link></CardTitle>
                {company.sector && <Badge variant="outline">{company.sector.name}</Badge>}
              </CardHeader>
              {company.description && <p className="text-sm text-slate-500 leading-relaxed mb-4">{company.description}</p>}
              <div className="grid grid-cols-4 gap-3">
                {company.revenueMm != null && (
                  <div className="text-center py-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Revenue</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(company.revenueMm)}</p>
                  </div>
                )}
                {company.ebitdaMm != null && (
                  <div className="text-center py-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">EBITDA</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(company.ebitdaMm)}</p>
                  </div>
                )}
                {company.revenueMm && company.ebitdaMm && (
                  <div className="text-center py-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Margin</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{((company.ebitdaMm / company.revenueMm) * 100).toFixed(1)}%</p>
                  </div>
                )}
                {company.employeeCount && (
                  <div className="text-center py-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Employees</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{company.employeeCount.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader className="mb-3">
              <CardTitle>Documents ({dealDocs.length})</CardTitle>
              <button onClick={() => setShowUpload(true)} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                <Upload className="h-3 w-3" /> Upload
              </button>
            </CardHeader>
            {dealDocs.length === 0 ? (
              <div
                onClick={() => setShowUpload(true)}
                className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-colors"
              >
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">Upload documents</p>
                <p className="text-xs text-slate-400 mt-0.5">Models, presentations, IC memos, legal docs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dealDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg group">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${docCategoryIcons[doc.category]}`}>
                      <File className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400">{DOC_CATEGORY_LABELS[doc.category]} · {formatBytes(doc.sizeBytes)} · {doc.uploadedBy}</p>
                    </div>
                    <button
                      onClick={() => { if (confirm("Remove this document?")) deleteDocument(doc.id); }}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Deal Activity Timeline */}
          <Card padding="none">
            <CardHeader className="px-4 pt-4 pb-0 mb-3">
              <CardTitle>Deal Activity ({dealActivities.length})</CardTitle>
              <button onClick={() => setShowActivityForm(true)} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                <Plus className="h-3 w-3" /> Log Activity
              </button>
            </CardHeader>
            {dealActivities.length === 0 ? (
              <div className="px-4 pb-4 text-sm text-slate-400">No activity logged yet.</div>
            ) : (
              <div>
                {dealActivities.map((activity, idx) => {
                  const config = ACTIVITY_TYPE_CONFIG[activity.activityType];
                  const IconComponent = activityIcons[config.icon];
                  return (
                    <div key={activity.id} className="px-4 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 ${config.color}`}>
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                          </div>
                          {idx < dealActivities.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-2" />}
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-slate-900">{activity.title}</h4>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              {activity.durationMin && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-0.5"><Clock className="h-3 w-3" />{activity.durationMin}min</span>
                              )}
                              <span className="text-[11px] text-slate-400">{formatRelativeTime(activity.occurredAt)}</span>
                            </div>
                          </div>
                          {activity.summary && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{activity.summary}</p>}
                          {activity.actionItems && activity.actionItems.length > 0 && (
                            <div className="mt-2.5 space-y-1.5">
                              {activity.actionItems.map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  {item.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />}
                                  <span className={item.done ? "text-slate-400 line-through" : "text-slate-700"}>
                                    {item.text}
                                    {item.dueDate && <span className="text-slate-400">{" · due "}{new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
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
          {/* Deal Team / Linked Contacts */}
          <Card>
            <CardHeader className="mb-3">
              <CardTitle>Deal Team</CardTitle>
              <button onClick={() => setShowLinkContact(true)} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> Add
              </button>
            </CardHeader>
            <div className="space-y-2.5">
              {deal.sourceContact && (
                <Link href={`/contacts/${deal.sourceContact.id}`} className="flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                  <Avatar firstName={deal.sourceContact.firstName} lastName={deal.sourceContact.lastName} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{deal.sourceContact.firstName} {deal.sourceContact.lastName}</p>
                    <p className="text-xs text-slate-400">Source Contact</p>
                  </div>
                </Link>
              )}
              {dealContactLinks.map((dc) =>
                dc.contact ? (
                  <div key={dc.contactId} className="flex items-center gap-3 group -mx-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                    <Link href={`/contacts/${dc.contactId}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar firstName={dc.contact.firstName} lastName={dc.contact.lastName} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{dc.contact.firstName} {dc.contact.lastName}</p>
                        <p className="text-xs text-slate-400">{dc.role}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => unlinkContactFromDeal(deal.id, dc.contactId)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null
              )}
              {!deal.sourceContact && dealContactLinks.length === 0 && (
                <p className="text-sm text-slate-400">No contacts linked.</p>
              )}
            </div>
          </Card>

          {/* Source */}
          {deal.sourceFirm && (
            <Card>
              <CardHeader className="mb-3"><CardTitle>Source / Advisor</CardTitle></CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{deal.sourceFirm.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{deal.sourceFirm.firmType.replace("_", " ")}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Key Dates */}
          <Card>
            <CardHeader className="mb-3"><CardTitle>Key Dates</CardTitle></CardHeader>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created</span>
                <span className="font-medium text-slate-900">{new Date(deal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Updated</span>
                <span className="font-medium text-slate-900">{new Date(deal.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              {deal.expectedCloseDate && (
                <>
                  <hr className="border-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Expected Close</span>
                    <span className="font-medium text-slate-900">{new Date(deal.expectedCloseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Days to Close</span>
                    <span className="font-medium text-slate-900">{Math.max(0, Math.ceil((new Date(deal.expectedCloseDate).getTime() - Date.now()) / 86400000))}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Related Indications */}
          {dealIndications.length > 0 && (
            <Card>
              <CardHeader className="mb-3"><CardTitle>Indications ({dealIndications.length})</CardTitle></CardHeader>
              <div className="space-y-2.5">
                {dealIndications.map((ind) => (
                  <div key={ind.id} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg">
                    <Badge variant={ind.side === "buy" ? "success" : ind.side === "sell" ? "danger" : "warning"} size="sm">{ind.side.toUpperCase()}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{ind.firm?.name}</p>
                      {ind.notes && <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{ind.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Secondary Details */}
          {deal.secondaryDetails && (
            <Card>
              <CardHeader className="mb-3"><CardTitle>Secondary Details</CardTitle></CardHeader>
              <div className="space-y-2.5 text-sm">
                {deal.secondaryDetails.fundName && <><div className="flex items-center justify-between"><span className="text-slate-400">Fund</span><span className="font-medium text-slate-900">{deal.secondaryDetails.fundName}</span></div></>}
                {deal.secondaryDetails.vintageYear && <><hr className="border-slate-100" /><div className="flex items-center justify-between"><span className="text-slate-400">Vintage</span><span className="font-medium text-slate-900">{deal.secondaryDetails.vintageYear}</span></div></>}
                {deal.secondaryDetails.navMm != null && <><hr className="border-slate-100" /><div className="flex items-center justify-between"><span className="text-slate-400">NAV</span><span className="font-medium text-slate-900">{formatCurrency(deal.secondaryDetails.navMm)}</span></div></>}
                {deal.secondaryDetails.discountPct != null && <><hr className="border-slate-100" /><div className="flex items-center justify-between"><span className="text-slate-400">Discount</span><span className="font-medium text-slate-900">{deal.secondaryDetails.discountPct}%</span></div></>}
                {deal.secondaryDetails.sellerType && <><hr className="border-slate-100" /><div className="flex items-center justify-between"><span className="text-slate-400">Seller</span><span className="font-medium text-slate-900 capitalize">{deal.secondaryDetails.sellerType}</span></div></>}
                {deal.secondaryDetails.rofr != null && <><hr className="border-slate-100" /><div className="flex items-center justify-between"><span className="text-slate-400">ROFR</span><span className="font-medium text-slate-900">{deal.secondaryDetails.rofr ? "Yes" : "No"}</span></div></>}
              </div>
            </Card>
          )}

          {/* Open Action Items */}
          <Card>
            <CardHeader className="mb-3"><CardTitle>Open Action Items</CardTitle></CardHeader>
            {(() => {
              const allItems = dealActivities.flatMap((a) => a.actionItems?.filter((i) => !i.done) || []);
              if (allItems.length === 0) return <p className="text-sm text-slate-400">No open items</p>;
              return (
                <div className="space-y-2.5">
                  {allItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-700 font-medium">{item.text}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.assignee && <span className="text-xs text-slate-400">{item.assignee}</span>}
                          {item.dueDate && <span className="text-xs text-slate-400">Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        </div>
      </div>

      <DealForm open={editing} onClose={() => setEditing(false)} deal={deal} />
      <ActivityForm open={showActivityForm} onClose={() => setShowActivityForm(false)} />

      {/* Upload Document Modal */}
      <UploadDocModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        dealId={deal.id}
        userName={user?.name || "Unknown"}
        onUpload={addDocument}
      />

      {/* Link Contact Modal */}
      <LinkContactModal
        open={showLinkContact}
        onClose={() => setShowLinkContact(false)}
        dealId={deal.id}
        contacts={contacts}
        existingLinks={dealContactLinks.map((dc) => dc.contactId)}
        onLink={linkContactToDeal}
      />
    </div>
  );
}

function UploadDocModal({
  open, onClose, dealId, userName, onUpload,
}: {
  open: boolean;
  onClose: () => void;
  dealId: string;
  userName: string;
  onUpload: (doc: any) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocCategory>("model");
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      if (!name) setName(file.name.replace(/\.[^.]+$/, ""));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onUpload({
      dealId,
      name: name || fileName,
      category,
      sizeBytes: fileSize || 1024000,
      uploadedBy: userName,
      url: "#",
    });
    setName("");
    setFileName("");
    setFileSize(0);
    setCategory("model");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload Document">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors"
          >
            {fileName ? (
              <div className="flex items-center justify-center gap-2">
                <File className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-700 font-medium">{fileName}</span>
                <span className="text-xs text-slate-400">({formatBytes(fileSize)})</span>
              </div>
            ) : (
              <>
                <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                <p className="text-sm text-slate-500">Click to select a file</p>
              </>
            )}
          </button>
        </div>
        <FormField label="Document Name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Q1 LBO Model" required />
        </FormField>
        <FormField label="Category">
          <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value as DocCategory)}>
            {(Object.entries(DOC_CATEGORY_LABELS) as [DocCategory, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </FormField>
        <FormActions onCancel={onClose} submitLabel="Upload" />
      </form>
    </Modal>
  );
}

function LinkContactModal({
  open, onClose, dealId, contacts, existingLinks, onLink,
}: {
  open: boolean;
  onClose: () => void;
  dealId: string;
  contacts: any[];
  existingLinks: string[];
  onLink: (dealId: string, contactId: string, role: string) => void;
}) {
  const [contactId, setContactId] = useState("");
  const [role, setRole] = useState("");

  const available = contacts.filter((c) => !existingLinks.includes(c.id));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (contactId) {
      onLink(dealId, contactId, role || "Team Member");
      setContactId("");
      setRole("");
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Link Contact to Deal">
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Contact">
          <select className={selectClass} value={contactId} onChange={(e) => setContactId(e.target.value)} required>
            <option value="">Select contact...</option>
            {available.map((c: any) => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.firm ? ` (${c.firm.name})` : ""}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Role on Deal">
          <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Sell-side Advisor, Company CFO, Co-Investor" />
        </FormField>
        <FormActions onCancel={onClose} submitLabel="Link Contact" />
      </form>
    </Modal>
  );
}
