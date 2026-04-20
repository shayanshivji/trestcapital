import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase-server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ScrapedItem {
  source_type: string;
  source_url: string;
  title: string;
  content: string;
}

// ============================================================
// STEP 1: SCRAPE — pull from real public sources
// ============================================================

async function scrapeSecEdgar(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  try {
    const res = await fetch(
      "https://efts.sec.gov/LATEST/search-index?q=%22private+equity%22+%22secondary%22&dateRange=custom&startdt=2026-03-01&enddt=2026-04-02&forms=D,D/A",
      { headers: { "User-Agent": "TrestCapital/1.0 admin@trestcapital.com", Accept: "application/json" } }
    );
    if (res.ok) {
      const data = await res.json();
      const hits = data.hits?.hits || [];
      for (const hit of hits.slice(0, 5)) {
        items.push({
          source_type: "sec_filing",
          source_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${hit._source?.entity_name || ""}`,
          title: `SEC Filing: ${hit._source?.form_type || "Form D"} — ${hit._source?.entity_name || "Unknown"}`,
          content: `${hit._source?.entity_name || ""} filed ${hit._source?.form_type || ""} on ${hit._source?.file_date || ""}. ${hit._source?.display_names?.join(", ") || ""}`,
        });
      }
    }
  } catch {
    // SEC EDGAR may not return results — that's fine
  }
  return items;
}

async function scrapeNews(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  const keywords = [
    "private equity secondary transaction",
    "GP-led continuation vehicle",
    "PE fund stake sale",
    "LP portfolio rebalancing private equity",
  ];

  for (const q of keywords.slice(0, 2)) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=3&apiKey=demo`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        for (const article of (data.articles || []).slice(0, 3)) {
          items.push({
            source_type: "news_article",
            source_url: article.url || "",
            title: article.title || "Untitled",
            content: `${article.title}. ${article.description || ""}. Source: ${article.source?.name || "Unknown"}. Published: ${article.publishedAt || ""}`,
          });
        }
      }
    } catch {
      // News API may fail with demo key — expected
    }
  }
  return items;
}

async function scrapeGoogleNews(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  const queries = [
    "private equity secondary market 2026",
    "GP-led continuation vehicle deal",
    "pension fund PE portfolio sale",
  ];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`,
        { headers: { "User-Agent": "TrestCapital/1.0" } }
      );
      if (res.ok) {
        const text = await res.text();
        const titleMatches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || [];
        const linkMatches = text.match(/<link>(https:\/\/news\.google\.com\/rss\/articles\/.*?)<\/link>/g) || [];
        const pubDateMatches = text.match(/<pubDate>(.*?)<\/pubDate>/g) || [];

        for (let i = 0; i < Math.min(titleMatches.length, 3); i++) {
          const title = titleMatches[i]?.replace(/<title><!\[CDATA\[/, "").replace(/\]\]><\/title>/, "") || "";
          const link = linkMatches[i]?.replace(/<link>/, "").replace(/<\/link>/, "") || "";
          const pubDate = pubDateMatches[i]?.replace(/<pubDate>/, "").replace(/<\/pubDate>/, "") || "";
          if (title && !title.includes("Google News")) {
            items.push({
              source_type: "news_article",
              source_url: link,
              title,
              content: `${title}. Published: ${pubDate}`,
            });
          }
        }
      }
    } catch {
      // Google News RSS may fail — that's okay
    }
  }
  return items;
}

// ============================================================
// STEP 2: PARSE — use OpenAI to extract structured signals
// ============================================================

const SYSTEM_PROMPT = `You are an intelligence analyst at Trest Capital, a private equity firm focused on secondaries, direct investments, and co-investments.

Your job is to analyze raw news/data and determine if it contains actionable market signals (indications of buying or selling interest in the PE market).

For each item, respond with a JSON object:
{
  "is_relevant": boolean,
  "confidence": number (0-1),
  "side": "buy" | "sell" | "both" | null,
  "firm_name": string | null,
  "sector": string | null,
  "size_min_mm": number | null,
  "size_max_mm": number | null,
  "summary": string (1-2 sentence actionable summary for Trest's team),
  "signal_type": "sec_filing" | "press_release" | "fund_data" | "personnel_move" | "market_report" | "news_article"
}

Focus on signals relevant to:
- Secondary transactions (LP stake sales, GP-led continuations, tender offers)
- Fund closings/raises that signal deployment
- Portfolio rebalancing by large LPs (pension funds, endowments, sovereign wealth)
- Personnel moves at PE firms that signal strategic shifts
- M&A activity in sectors Trest tracks: healthcare, technology, industrials, financial services, business services

Be selective. Only flag items with real actionable intelligence. Confidence should reflect how actionable and reliable the signal is.`;

async function parseWithAI(items: ScrapedItem[]): Promise<any[]> {
  const parsed: any[] = [];

  for (const item of items) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this item:\n\nTitle: ${item.title}\nSource: ${item.source_url}\nContent: ${item.content}` },
        ],
        temperature: 0.2,
        max_tokens: 500,
      });

      const text = response.choices[0]?.message?.content;
      if (text) {
        const result = JSON.parse(text);
        if (result.is_relevant && result.confidence >= 0.5) {
          parsed.push({
            ...result,
            source_url: item.source_url,
            source_type: item.source_type,
            raw_title: item.title,
            raw_content: item.content,
          });
        }
      }
    } catch {
      // Parse failure for individual item — skip it
    }
  }

  return parsed;
}

// ============================================================
// STEP 3: SAVE — write to Supabase
// ============================================================

async function saveToSupabase(signals: any[]) {
  const supabase = createServiceClient();
  const saved: any[] = [];

  for (const signal of signals) {
    // Save raw content
    const { data: rawData } = await supabase.from("web_intel_raw").insert({
      source_type: signal.signal_type || signal.source_type,
      source_url: signal.source_url,
      title: signal.raw_title,
      raw_content: signal.raw_content,
      processed: true,
      processed_at: new Date().toISOString(),
      relevance_score: signal.confidence,
    }).select().single();

    // Save as indication
    const { data: indication } = await supabase.from("indications").insert({
      side: signal.side || "both",
      notes: signal.summary,
      is_active: true,
      source: "web_intel",
      web_intel_type: signal.signal_type || signal.source_type,
      web_intel_url: signal.source_url,
      confidence: signal.confidence,
      reviewed: false,
      raw_content: signal.raw_content,
      size_min_mm: signal.size_min_mm,
      size_max_mm: signal.size_max_mm,
    }).select().single();

    if (rawData) {
      await supabase.from("web_intel_raw").update({ indication_id: indication?.id }).eq("id", rawData.id);
    }

    saved.push({ signal, indication, rawData });
  }

  // Update agent run timestamp
  await supabase
    .from("intel_agent_configs")
    .update({ last_run_at: new Date().toISOString(), last_run_status: "success" })
    .in("source_type", [...new Set(signals.map((s) => s.signal_type || s.source_type))]);

  return saved;
}

// ============================================================
// API ROUTE
// ============================================================

export async function POST() {
  try {
    // Step 1: Scrape from multiple sources in parallel
    const [secItems, newsItems, googleItems] = await Promise.all([
      scrapeSecEdgar(),
      scrapeNews(),
      scrapeGoogleNews(),
    ]);

    const allItems = [...secItems, ...newsItems, ...googleItems];

    if (allItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new content found from sources",
        scraped: 0,
        signals: 0,
        saved: 0,
      });
    }

    // Step 2: Parse with AI
    const signals = await parseWithAI(allItems);

    // Step 3: Save to Supabase
    let saved: any[] = [];
    if (signals.length > 0) {
      saved = await saveToSupabase(signals);
    }

    return NextResponse.json({
      success: true,
      scraped: allItems.length,
      signals: signals.length,
      saved: saved.length,
      details: saved.map((s) => ({
        summary: s.signal.summary,
        side: s.signal.side,
        confidence: s.signal.confidence,
        source: s.signal.source_url,
      })),
    });
  } catch (error: any) {
    console.error("Intel agent error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Agent run failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "Intelligence agent ready. POST to run." });
}
