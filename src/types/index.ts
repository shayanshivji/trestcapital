export type DealStage =
  | "sourced"
  | "initial_review"
  | "management_meeting"
  | "due_diligence"
  | "loi_bid"
  | "exclusivity"
  | "closing"
  | "closed_won"
  | "passed"
  | "dead";

export type DealType =
  | "platform"
  | "bolt_on"
  | "co_invest"
  | "secondary_direct"
  | "secondary_fund"
  | "secondary_structured"
  | "gp_led"
  | "tender_offer"
  | "recapitalization"
  | "growth_equity";

export type IndicationSide = "buy" | "sell" | "both";

export type ActivityType =
  | "phone_call"
  | "video_meeting"
  | "in_person_meeting"
  | "email"
  | "internal_note"
  | "slack_message";

export type FirmType =
  | "pe_fund"
  | "strategic"
  | "investment_bank"
  | "advisory"
  | "law_firm"
  | "accounting"
  | "consulting"
  | "lender"
  | "other";

export type Sentiment = "positive" | "neutral" | "negative";

export interface Sector {
  id: string;
  name: string;
  parentId?: string;
}

export interface Firm {
  id: string;
  name: string;
  firmType: FirmType;
  website?: string;
  hqCity?: string;
  hqState?: string;
  aumMm?: number;
  description?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  title?: string;
  firmId?: string;
  firm?: Firm;
  linkedinUrl?: string;
  notes?: string;
  isActive: boolean;
  lastContactedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  codename?: string;
  description?: string;
  sectorId?: string;
  sector?: Sector;
  hqCity?: string;
  hqState?: string;
  website?: string;
  revenueMm?: number;
  ebitdaMm?: number;
  employeeCount?: number;
  yearFounded?: number;
  ownerFirmId?: string;
  ownerFirm?: Firm;
}

export interface SecondaryDetails {
  fundName?: string;
  vintageYear?: number;
  navMm?: number;
  discountPct?: number;
  sellerType?: "lp" | "gp" | "founder" | "employee" | "direct";
  shareClass?: string;
  transferRestrictions?: string;
  rofr?: boolean;
  boardApprovalRequired?: boolean;
  lastRoundValuationMm?: number;
  impliedValuationMm?: number;
}

export interface Deal {
  id: string;
  title: string;
  companyId?: string;
  company?: Company;
  stage: DealStage;
  dealType?: DealType;
  enterpriseValueMm?: number;
  equityCheckMm?: number;
  sourceFirmId?: string;
  sourceFirm?: Firm;
  sourceContactId?: string;
  sourceContact?: Contact;
  description?: string;
  thesis?: string;
  priority: number;
  expectedCloseDate?: string;
  secondaryDetails?: SecondaryDetails;
  createdAt: string;
  updatedAt: string;
}

export type IndicationSource = "manual" | "relationship" | "web_intel";

export type WebIntelType =
  | "sec_filing"
  | "press_release"
  | "fund_data"
  | "personnel_move"
  | "market_report"
  | "news_article";

export interface Indication {
  id: string;
  side: IndicationSide;
  firmId?: string;
  firm?: Firm;
  contactId?: string;
  contact?: Contact;
  companyId?: string;
  company?: Company;
  sectorId?: string;
  sector?: Sector;
  sizeMinMm?: number;
  sizeMaxMm?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  source: IndicationSource;
  sourceActivityId?: string;
  webIntelType?: WebIntelType;
  webIntelUrl?: string;
  confidence?: number;
  reviewed?: boolean;
}

export const INDICATION_SOURCE_CONFIG: Record<IndicationSource, { label: string; color: string; bgColor: string }> = {
  manual: { label: "Manual", color: "text-slate-700", bgColor: "bg-slate-100" },
  relationship: { label: "Relationship", color: "text-brand-700", bgColor: "bg-brand-100" },
  web_intel: { label: "Web Intel", color: "text-violet-700", bgColor: "bg-violet-100" },
};

export const WEB_INTEL_TYPE_CONFIG: Record<WebIntelType, { label: string; icon: string }> = {
  sec_filing: { label: "SEC Filing", icon: "FileText" },
  press_release: { label: "Press Release", icon: "Newspaper" },
  fund_data: { label: "Fund Data", icon: "Database" },
  personnel_move: { label: "Personnel Move", icon: "UserCheck" },
  market_report: { label: "Market Report", icon: "BarChart3" },
  news_article: { label: "News", icon: "Globe" },
};

export interface Activity {
  id: string;
  activityType: ActivityType;
  title: string;
  summary?: string;
  rawNotes?: string;
  dealId?: string;
  deal?: Deal;
  companyId?: string;
  company?: Company;
  occurredAt: string;
  durationMin?: number;
  sentiment?: Sentiment;
  actionItems?: ActionItem[];
  participants?: Contact[];
  createdAt: string;
}

export interface ActionItem {
  text: string;
  assignee?: string;
  dueDate?: string;
  done: boolean;
}

export type DocCategory = "model" | "presentation" | "memo" | "legal" | "diligence" | "other";

export const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
  model: "Model",
  presentation: "Presentation",
  memo: "IC Memo",
  legal: "Legal",
  diligence: "Diligence",
  other: "Other",
};

export interface DealDocument {
  id: string;
  dealId: string;
  name: string;
  category: DocCategory;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface DealContactLink {
  dealId: string;
  contactId: string;
  role: string;
}

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  platform: "Platform",
  bolt_on: "Bolt-on",
  co_invest: "Co-Invest",
  secondary_direct: "Direct Secondary",
  secondary_fund: "Fund Secondary",
  secondary_structured: "Structured Secondary",
  gp_led: "GP-Led",
  tender_offer: "Tender Offer",
  recapitalization: "Recap",
  growth_equity: "Growth Equity",
};

export const DEAL_STAGE_CONFIG: Record<
  DealStage,
  { label: string; color: string; bgColor: string }
> = {
  sourced: {
    label: "Sourced",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
  },
  initial_review: {
    label: "Initial Review",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  management_meeting: {
    label: "Mgmt Meeting",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
  },
  due_diligence: {
    label: "Due Diligence",
    color: "text-violet-700",
    bgColor: "bg-violet-100",
  },
  loi_bid: {
    label: "LOI / Bid",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  exclusivity: {
    label: "Exclusivity",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  closing: {
    label: "Closing",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  closed_won: {
    label: "Closed",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  passed: {
    label: "Passed",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  dead: { label: "Dead", color: "text-red-700", bgColor: "bg-red-100" },
};

export const ACTIVITY_TYPE_CONFIG: Record<
  ActivityType,
  { label: string; icon: string; color: string }
> = {
  phone_call: {
    label: "Phone Call",
    icon: "Phone",
    color: "text-blue-600",
  },
  video_meeting: {
    label: "Video Meeting",
    icon: "Video",
    color: "text-purple-600",
  },
  in_person_meeting: {
    label: "In-Person",
    icon: "Users",
    color: "text-emerald-600",
  },
  email: { label: "Email", icon: "Mail", color: "text-amber-600" },
  internal_note: {
    label: "Internal Note",
    icon: "FileText",
    color: "text-slate-600",
  },
  slack_message: {
    label: "Slack",
    icon: "MessageSquare",
    color: "text-pink-600",
  },
};

export const PIPELINE_STAGES: DealStage[] = [
  "sourced",
  "initial_review",
  "management_meeting",
  "due_diligence",
  "loi_bid",
  "exclusivity",
  "closing",
];
