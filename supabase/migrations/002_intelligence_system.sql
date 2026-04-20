-- Intelligence System: multi-source market signal pipeline
-- Extends indications with source tracking, web intel, and AI extraction

-- ============================================================
-- NEW ENUMS
-- ============================================================

CREATE TYPE indication_source AS ENUM ('manual', 'relationship', 'web_intel');

CREATE TYPE web_intel_type AS ENUM (
  'sec_filing',
  'press_release',
  'fund_data',
  'personnel_move',
  'market_report',
  'news_article'
);

-- ============================================================
-- ALTER INDICATIONS: add source tracking
-- ============================================================

ALTER TABLE indications
  ADD COLUMN source           indication_source NOT NULL DEFAULT 'manual',
  ADD COLUMN web_intel_type   web_intel_type,
  ADD COLUMN web_intel_url    TEXT,
  ADD COLUMN confidence       NUMERIC DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN reviewed         BOOLEAN DEFAULT FALSE,
  ADD COLUMN reviewed_by      UUID,
  ADD COLUMN reviewed_at      TIMESTAMPTZ,
  ADD COLUMN raw_content      TEXT;              -- original scraped text before AI parsing

-- Update source_activity_id to be a proper FK now
ALTER TABLE indications
  ADD CONSTRAINT fk_indications_source_activity
  FOREIGN KEY (source_activity_id) REFERENCES activities(id) ON DELETE SET NULL;

-- ============================================================
-- WEB INTELLIGENCE: raw scraped content before AI processing
-- ============================================================

CREATE TABLE web_intel_raw (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type   web_intel_type NOT NULL,
  source_url    TEXT NOT NULL,
  title         TEXT,
  raw_content   TEXT NOT NULL,
  scraped_at    TIMESTAMPTZ DEFAULT now(),
  processed     BOOLEAN DEFAULT FALSE,
  processed_at  TIMESTAMPTZ,
  indication_id UUID REFERENCES indications(id) ON DELETE SET NULL,
  relevance_score NUMERIC DEFAULT 0 CHECK (relevance_score BETWEEN 0 AND 1),
  discarded     BOOLEAN DEFAULT FALSE,
  discard_reason TEXT
);

-- ============================================================
-- INTELLIGENCE AGENT CONFIG: what to scrape and how
-- ============================================================

CREATE TABLE intel_agent_configs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  source_type   web_intel_type NOT NULL,
  enabled       BOOLEAN DEFAULT TRUE,
  schedule_cron TEXT DEFAULT '0 */2 * * *',     -- every 2 hours
  config        JSONB DEFAULT '{}'::jsonb,       -- source-specific config (API keys, search terms, etc.)
  last_run_at   TIMESTAMPTZ,
  last_run_status TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INTELLIGENCE KEYWORDS: what topics matter to Trest
-- ============================================================

CREATE TABLE intel_keywords (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword       TEXT NOT NULL,
  category      TEXT DEFAULT 'general',          -- 'firm', 'sector', 'deal_type', 'general'
  weight        NUMERIC DEFAULT 1.0,             -- boost relevance scoring
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Pre-populate with Trest's focus areas
INSERT INTO intel_keywords (keyword, category, weight) VALUES
  ('secondary', 'deal_type', 2.0),
  ('continuation vehicle', 'deal_type', 2.0),
  ('GP-led', 'deal_type', 2.0),
  ('tender offer', 'deal_type', 1.8),
  ('LP liquidity', 'deal_type', 1.8),
  ('fund stake', 'deal_type', 1.5),
  ('portfolio rebalancing', 'deal_type', 1.5),
  ('Form D', 'deal_type', 1.3),
  ('13F', 'deal_type', 1.3),
  ('private equity', 'general', 1.0),
  ('buyout', 'general', 1.0),
  ('co-invest', 'deal_type', 1.5),
  ('healthcare', 'sector', 1.2),
  ('technology', 'sector', 1.2),
  ('financial services', 'sector', 1.2),
  ('industrials', 'sector', 1.2),
  ('business services', 'sector', 1.2),
  ('cybersecurity', 'sector', 1.3),
  ('SaaS', 'sector', 1.2),
  ('KKR', 'firm', 1.5),
  ('Thoma Bravo', 'firm', 1.5),
  ('Bain Capital', 'firm', 1.5),
  ('Vista Equity', 'firm', 1.5),
  ('Warburg Pincus', 'firm', 1.5),
  ('Goldman Sachs', 'firm', 1.3),
  ('Evercore', 'firm', 1.3),
  ('Lazard', 'firm', 1.3),
  ('Morgan Stanley', 'firm', 1.3);

-- Pre-populate agent configs
INSERT INTO intel_agent_configs (name, source_type, config) VALUES
  ('SEC EDGAR Monitor', 'sec_filing', '{"endpoint": "https://efts.sec.gov/LATEST/search-index", "form_types": ["D", "D/A", "13F-HR"], "keywords": ["secondary", "private placement"]}'),
  ('PE News Scanner', 'news_article', '{"sources": ["bloomberg", "reuters", "wsj", "pitchbook"], "keywords": ["private equity", "secondary", "continuation vehicle", "GP-led"]}'),
  ('Fund Data Tracker', 'fund_data', '{"sources": ["pitchbook", "preqin"], "monitor": ["fund_closings", "fund_raises", "performance_updates"]}'),
  ('LinkedIn Personnel Monitor', 'personnel_move', '{"monitor_firms": ["KKR", "Thoma Bravo", "Bain Capital", "Vista Equity", "Warburg Pincus"], "roles": ["Partner", "Managing Director", "Head of"]}'),
  ('Market Report Aggregator', 'market_report', '{"sources": ["jefferies", "lincoln_international", "houlihan_lokey"], "topics": ["M&A activity", "multiples", "sector trends"]}'),
  ('Press Release Monitor', 'press_release', '{"monitor": ["calpers", "cppib", "gic", "adia"], "topics": ["rebalancing", "allocation", "divestiture"]}');

-- ============================================================
-- DEAL DOCUMENTS
-- ============================================================

CREATE TABLE deal_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id       UUID REFERENCES deals(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('model', 'presentation', 'memo', 'legal', 'diligence', 'other')),
  file_path     TEXT NOT NULL,
  size_bytes    BIGINT,
  uploaded_by   UUID,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_indications_source ON indications(source);
CREATE INDEX idx_indications_reviewed ON indications(reviewed) WHERE reviewed = FALSE;
CREATE INDEX idx_indications_confidence ON indications(confidence);
CREATE INDEX idx_web_intel_raw_processed ON web_intel_raw(processed) WHERE processed = FALSE;
CREATE INDEX idx_web_intel_raw_source ON web_intel_raw(source_type);
CREATE INDEX idx_deal_documents_deal ON deal_documents(deal_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER trg_intel_agent_configs_updated_at BEFORE UPDATE ON intel_agent_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
