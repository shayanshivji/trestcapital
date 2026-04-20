"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import {
  User, Shield, Bell, Bot, Key, Globe, Mail, Palette,
  ChevronRight, Check, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "notifications" | "intelligence" | "appearance";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile & Security", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "intelligence", label: "Intelligence Agent", icon: Bot },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        enabled ? "bg-brand-500" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
          enabled ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [intelNotifs, setIntelNotifs] = useState(true);
  const [overdueNotifs, setOverdueNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [autoRunAgent, setAutoRunAgent] = useState(false);
  const [agentFrequency, setAgentFrequency] = useState("daily");
  const [secEdgar, setSecEdgar] = useState(true);
  const [newsApi, setNewsApi] = useState(true);
  const [googleNews, setGoogleNews] = useState(true);
  const [minConfidence, setMinConfidence] = useState(0.6);
  const [keywords, setKeywords] = useState("private equity, secondaries, GP-led, continuation fund, fund restructuring, LP stake, fund interest, NAV lending");

  const [theme, setTheme] = useState<"Light" | "Dark" | "System">("Light");
  const [compactMode, setCompactMode] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account, notifications, and system preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-56 shrink-0">
          <nav className="space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left",
                  activeTab === tab.id
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="flex-1">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="h-4 w-4 opacity-50" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

            {/* Profile */}
            {activeTab === "profile" && (
              <div className="p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Profile & Security</h3>
                <p className="text-xs text-slate-400 mb-6">Manage your account details and security preferences</p>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                  <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-lg font-bold">
                    {user?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??"}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{user?.name || "—"}</p>
                    <p className="text-sm text-slate-500">{user?.email || "—"}</p>
                    <p className="text-xs text-brand-600 font-medium mt-0.5">{user?.role || "—"}</p>
                  </div>
                </div>

                <SettingRow icon={Mail} label="Email" description="Your login email address">
                  <span className="text-sm text-slate-600">{user?.email || "—"}</span>
                </SettingRow>
                <SettingRow icon={Shield} label="Role" description="Access level for this account">
                  <span className="text-sm text-slate-600 bg-brand-50 text-brand-700 px-3 py-1 rounded-full font-medium">
                    {user?.role || "—"}
                  </span>
                </SettingRow>
                <SettingRow icon={Key} label="Password" description="Last changed: never">
                  <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">Change</button>
                </SettingRow>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Notification Preferences</h3>
                <p className="text-xs text-slate-400 mb-6">Control what notifications you receive and how</p>

                <SettingRow icon={Bell} label="In-app notifications" description="Show notifications in the sidebar panel">
                  <Toggle enabled={inAppNotifs} onChange={setInAppNotifs} />
                </SettingRow>
                <SettingRow icon={Mail} label="Email notifications" description="Receive notifications via email">
                  <Toggle enabled={emailNotifs} onChange={setEmailNotifs} />
                </SettingRow>
                <SettingRow icon={Bot} label="Intelligence alerts" description="Get notified when new signals are detected">
                  <Toggle enabled={intelNotifs} onChange={setIntelNotifs} />
                </SettingRow>
                <SettingRow
                  icon={Bell}
                  label="Overdue action item alerts"
                  description="Notify when action items pass their due date"
                >
                  <Toggle enabled={overdueNotifs} onChange={setOverdueNotifs} />
                </SettingRow>
                <SettingRow icon={Mail} label="Weekly digest" description="Summary email of the week's activity">
                  <Toggle enabled={weeklyDigest} onChange={setWeeklyDigest} />
                </SettingRow>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saved ? "Saved" : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* Intelligence Agent */}
            {activeTab === "intelligence" && (
              <div className="p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Intelligence Agent</h3>
                <p className="text-xs text-slate-400 mb-6">Configure the AI-powered web intelligence pipeline</p>

                <SettingRow icon={Bot} label="Auto-run agent" description="Automatically run the agent on a schedule">
                  <Toggle enabled={autoRunAgent} onChange={setAutoRunAgent} />
                </SettingRow>

                {autoRunAgent && (
                  <SettingRow icon={Bot} label="Run frequency" description="How often the agent scans for new signals">
                    <select
                      value={agentFrequency}
                      onChange={(e) => setAgentFrequency(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    >
                      <option value="hourly">Every hour</option>
                      <option value="4hours">Every 4 hours</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </SettingRow>
                )}

                <div className="mt-6 mb-4">
                  <p className="text-sm font-semibold text-slate-900 mb-3">Data Sources</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-slate-700">SEC EDGAR Filings</span>
                      </div>
                      <Toggle enabled={secEdgar} onChange={setSecEdgar} />
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-slate-700">NewsAPI</span>
                      </div>
                      <Toggle enabled={newsApi} onChange={setNewsApi} />
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-slate-700">Google News RSS</span>
                      </div>
                      <Toggle enabled={googleNews} onChange={setGoogleNews} />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-slate-900 block mb-2">
                    Minimum Confidence Threshold
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={minConfidence}
                      onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                      className="flex-1 accent-brand-500"
                    />
                    <span className="text-sm font-mono text-slate-700 w-12 text-right">
                      {Math.round(minConfidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Signals below this threshold will still be saved but flagged for review</p>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-semibold text-slate-900 block mb-2">
                    Keywords
                  </label>
                  <textarea
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-y"
                    placeholder="Comma-separated keywords the agent will search for..."
                  />
                  <p className="text-xs text-slate-400 mt-1">Comma-separated terms the intelligence agent scans for</p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                    onClick={() => {
                      setAutoRunAgent(false);
                      setAgentFrequency("daily");
                      setSecEdgar(true);
                      setNewsApi(true);
                      setGoogleNews(true);
                      setMinConfidence(0.6);
                      setKeywords("private equity, secondaries, GP-led, continuation fund, fund restructuring, LP stake, fund interest, NAV lending");
                    }}
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saved ? "Saved" : "Save Configuration"}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <div className="p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Appearance</h3>
                <p className="text-xs text-slate-400 mb-6">Customize the look and feel of the application</p>

                <SettingRow icon={Palette} label="Theme" description="Select your preferred color scheme">
                  <div className="flex items-center gap-1.5">
                    {(["Light", "Dark", "System"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                          theme === t
                            ? "bg-brand-50 text-brand-700 border-brand-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow icon={Palette} label="Compact mode" description="Reduce spacing for a denser view">
                  <Toggle enabled={compactMode} onChange={setCompactMode} />
                </SettingRow>

                <SettingRow icon={Palette} label="Sidebar" description="Always keep the sidebar visible">
                  <Toggle enabled={sidebarVisible} onChange={setSidebarVisible} />
                </SettingRow>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saved ? "Saved" : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
