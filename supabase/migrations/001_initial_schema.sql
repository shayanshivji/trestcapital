-- PE CRM: Core Schema
-- Single source of truth for deal flow, relationships, and activity

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE deal_stage AS ENUM (
  'sourced',
  'initial_review',
  'management_meeting',
  'due_diligence',
  'loi_bid',
  'exclusivity',
  'closing',
  'closed_won',
  'passed',
  'dead'
);

CREATE TYPE deal_type AS ENUM (
  'platform',              -- new platform acquisition
  'bolt_on',               -- add-on to existing portfolio
  'co_invest',             -- co-investment alongside another sponsor
  'secondary_direct',      -- direct secondary (buying shares from holders)
  'secondary_fund',        -- fund secondary (buying LP interests)
  'secondary_structured',  -- structured secondary (preferred equity, strips, etc.)
  'gp_led',                -- GP-led continuation vehicle / recap
  'tender_offer',          -- company-run tender offer
  'recapitalization',      -- recap
  'growth_equity'          -- minority growth investment
);

CREATE TYPE indication_side AS ENUM ('buy', 'sell', 'both');

CREATE TYPE activity_type AS ENUM (
  'phone_call',
  'video_meeting',
  'in_person_meeting',
  'email',
  'internal_note',
  'slack_message'
);

CREATE TYPE firm_type AS ENUM (
  'pe_fund',
  'strategic',
  'investment_bank',
  'advisory',
  'law_firm',
  'accounting',
  'consulting',
  'lender',
  'other'
);

CREATE TYPE contact_role AS ENUM (
  'partner',
  'managing_director',
  'director',
  'vice_president',
  'associate',
  'analyst',
  'ceo',
  'cfo',
  'coo',
  'cto',
  'board_member',
  'advisor',
  'other'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE sectors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  parent_id     UUID REFERENCES sectors(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE firms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  firm_type     firm_type NOT NULL DEFAULT 'other',
  website       TEXT,
  hq_city       TEXT,
  hq_state      TEXT,
  aum_mm        NUMERIC,                    -- assets under management in $MM
  description   TEXT,
  is_our_firm   BOOLEAN DEFAULT FALSE,      -- flag for the user's own firm
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  role          contact_role,
  title         TEXT,                        -- free-form title
  firm_id       UUID REFERENCES firms(id) ON DELETE SET NULL,
  linkedin_url  TEXT,
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  last_contacted_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  codename      TEXT,                        -- deal codename (e.g. "Project Atlas")
  description   TEXT,
  sector_id     UUID REFERENCES sectors(id),
  hq_city       TEXT,
  hq_state      TEXT,
  website       TEXT,
  revenue_mm    NUMERIC,                     -- annual revenue in $MM
  ebitda_mm     NUMERIC,                     -- EBITDA in $MM
  employee_count INTEGER,
  year_founded  INTEGER,
  owner_firm_id UUID REFERENCES firms(id),   -- current PE owner if any
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,               -- "Project Atlas" or descriptive name
  company_id    UUID REFERENCES companies(id),
  stage         deal_stage NOT NULL DEFAULT 'sourced',
  deal_type     deal_type,
  enterprise_value_mm  NUMERIC,              -- EV in $MM
  equity_check_mm      NUMERIC,              -- equity check in $MM
  source_firm_id       UUID REFERENCES firms(id), -- who brought the deal
  source_contact_id    UUID REFERENCES contacts(id),
  lead_partner_id      UUID REFERENCES contacts(id), -- internal lead
  description   TEXT,
  thesis        TEXT,                        -- investment thesis
  priority      INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  expected_close_date  DATE,
  actual_close_date    DATE,
  passed_reason TEXT,
  -- Secondary-specific fields
  fund_name              TEXT,
  vintage_year           INTEGER,
  nav_mm                 NUMERIC,
  discount_pct           NUMERIC,
  seller_type            TEXT CHECK (seller_type IN ('lp', 'gp', 'founder', 'employee', 'direct')),
  share_class            TEXT,
  transfer_restrictions  TEXT,
  rofr                   BOOLEAN,
  board_approval_required BOOLEAN,
  last_round_valuation_mm NUMERIC,
  implied_valuation_mm   NUMERIC,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deal_team (
  deal_id       UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id    UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role          TEXT,                        -- "Lead", "Support", "Advisor"
  added_at      TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (deal_id, contact_id)
);

-- ============================================================
-- INDICATIONS: who wants to buy/sell what
-- ============================================================

CREATE TABLE indications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  side          indication_side NOT NULL,
  firm_id       UUID REFERENCES firms(id),
  contact_id    UUID REFERENCES contacts(id),
  company_id    UUID REFERENCES companies(id), -- specific company, or NULL for sector-level
  sector_id     UUID REFERENCES sectors(id),   -- sector-level interest
  size_min_mm   NUMERIC,
  size_max_mm   NUMERIC,
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  source_activity_id UUID,                     -- which activity surfaced this
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ACTIVITY LOG: the unified feed
-- ============================================================

CREATE TABLE activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type activity_type NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT,                         -- AI summary or manual notes
  raw_notes     TEXT,                         -- full call notes / transcript
  deal_id       UUID REFERENCES deals(id) ON DELETE SET NULL,
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_min  INTEGER,                      -- call/meeting duration
  sentiment     TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  action_items  JSONB DEFAULT '[]'::jsonb,    -- [{text, assignee, due_date, done}]
  created_by    UUID,                         -- user who logged it
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activity_participants (
  activity_id   UUID REFERENCES activities(id) ON DELETE CASCADE,
  contact_id    UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role          TEXT DEFAULT 'participant',   -- "host", "participant", "cc"
  PRIMARY KEY (activity_id, contact_id)
);

-- ============================================================
-- TAGS: flexible labeling across entities
-- ============================================================

CREATE TABLE tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  color         TEXT DEFAULT '#6366f1',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deal_tags (
  deal_id       UUID REFERENCES deals(id) ON DELETE CASCADE,
  tag_id        UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (deal_id, tag_id)
);

CREATE TABLE company_tags (
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  tag_id        UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, tag_id)
);

-- ============================================================
-- PIPELINE SNAPSHOTS: for tracking pipeline over time
-- ============================================================

CREATE TABLE pipeline_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_deals   INTEGER,
  total_ev_mm   NUMERIC,
  by_stage      JSONB,                       -- {stage: {count, total_ev}}
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_company ON deals(company_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_company ON activities(company_id);
CREATE INDEX idx_activities_occurred ON activities(occurred_at DESC);
CREATE INDEX idx_contacts_firm ON contacts(firm_id);
CREATE INDEX idx_indications_active ON indications(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_indications_side ON indications(side);
CREATE INDEX idx_companies_sector ON companies(sector_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_firms_updated_at BEFORE UPDATE ON firms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_indications_updated_at BEFORE UPDATE ON indications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
