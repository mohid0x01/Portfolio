import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Bug, Shield, AlertTriangle, CheckCircle2, Clock, X,
  RefreshCw, Search, ChevronDown, Plus, Trash2, Eye,
  Zap, Info, Flag, Edit3, ExternalLink, Hash, Activity
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Severity = "critical" | "high" | "medium" | "low" | "info";
type Status = "open" | "triaging" | "confirmed" | "resolved" | "wont-fix";

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  category: string;
  reporter_name: string | null;
  reporter_contact: string | null;
  steps_to_reproduce: string | null;
  expected_behavior: string | null;
  actual_behavior: string | null;
  affected_url: string | null;
  proof_of_concept: string | null;
  cvss_score: number | null;
  bounty_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Config ────────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  critical: { label: "Critical", color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/30",    icon: Zap },
  high:     { label: "High",     color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", icon: AlertTriangle },
  medium:   { label: "Medium",   color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", icon: Flag },
  low:      { label: "Low",      color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30",   icon: Info },
  info:     { label: "Info",     color: "text-muted-foreground", bg: "bg-muted/20", border: "border-border/30",     icon: Info },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  "open":      { label: "Open",      color: "text-secondary",        bg: "bg-secondary/15"  },
  "triaging":  { label: "Triaging",  color: "text-yellow-400",       bg: "bg-yellow-400/15" },
  "confirmed": { label: "Confirmed", color: "text-orange-400",       bg: "bg-orange-400/15" },
  "resolved":  { label: "Resolved",  color: "text-primary",          bg: "bg-primary/15"    },
  "wont-fix":  { label: "Won't Fix", color: "text-muted-foreground", bg: "bg-muted/20"      },
};

const CATEGORIES = ["XSS", "SQLi", "SSRF", "RCE", "IDOR", "Auth Bypass", "Info Disclosure", "CSRF", "LFI/RFI", "Misconfiguration", "Logic Error", "Other"];
const STATUS_FLOW: Status[] = ["open", "triaging", "confirmed", "resolved", "wont-fix"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
};

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function BugDrawer({ report, onClose, onUpdate }: { report: BugReport; onClose: () => void; onUpdate: (r: BugReport) => void }) {
  const sev = SEVERITY_CONFIG[report.severity];
  const sta = STATUS_CONFIG[report.status];
  const SevIcon = sev.icon;
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(report.notes ?? "");
  const [bounty, setBounty] = useState(report.bounty_amount?.toString() ?? "");

  const nextStatus = () => {
    const idx = STATUS_FLOW.indexOf(report.status);
    return STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
  };

  const setStatus = async (status: Status) => {
    setSaving(true);
    const { data } = await supabase.from("bug_reports").update({ status }).eq("id", report.id).select().single();
    if (data) onUpdate(data as unknown as BugReport);
    setSaving(false);
  };

  const saveNotes = async () => {
    setSaving(true);
    const bountyNum = bounty ? parseFloat(bounty) : null;
    const { data } = await supabase.from("bug_reports").update({ notes, bounty_amount: bountyNum }).eq("id", report.id).select().single();
    if (data) onUpdate(data as unknown as BugReport);
    setSaving(false);
  };

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{value}</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg flex flex-col border-l border-border/30"
        style={{ background: "hsl(var(--card))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/20 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl ${sev.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <SevIcon className={`w-4 h-4 ${sev.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm leading-tight">{report.title}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${sev.bg} ${sev.color} ${sev.border}`}>
                  {sev.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sta.bg} ${sta.color}`}>
                  {sta.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono px-2 py-0.5 rounded-full bg-muted/20">
                  {report.category}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="px-5 py-2.5 border-b border-border/10 flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0" style={{ background: "hsl(var(--muted)/0.15)" }}>
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>{new Date(report.created_at).toLocaleString()}</span>
          <span className="ml-auto text-secondary font-mono font-bold">{relTime(report.created_at)}</span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 scrollbar-thin">
          <Field label="Description" value={report.description} />
          <Field label="Reporter" value={report.reporter_name ?? "Anonymous"} />
          <Field label="Contact" value={report.reporter_contact} />
          <Field label="Affected URL" value={report.affected_url} />
          {report.cvss_score != null && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">CVSS Score</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(report.cvss_score / 10) * 100}%`, background: report.cvss_score >= 9 ? "hsl(0 80% 60%)" : report.cvss_score >= 7 ? "hsl(25 90% 55%)" : report.cvss_score >= 4 ? "hsl(45 90% 55%)" : "hsl(200 80% 55%)" }} />
                </div>
                <span className="font-mono font-bold text-sm">{report.cvss_score}</span>
              </div>
            </div>
          )}
          <Field label="Steps to Reproduce" value={report.steps_to_reproduce} />
          <Field label="Expected Behavior" value={report.expected_behavior} />
          <Field label="Actual Behavior" value={report.actual_behavior} />
          {report.proof_of_concept && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Proof of Concept</p>
              <pre className="text-[10px] font-mono text-secondary/80 p-3 rounded-xl overflow-x-auto max-h-40 scrollbar-thin border border-border/20" style={{ background: "hsl(0 0% 3%)" }}>
                {report.proof_of_concept}
              </pre>
            </div>
          )}

          {/* Admin notes */}
          <div className="mb-3 pt-2 border-t border-border/20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Admin Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes, triage findings…"
              className="w-full px-3 py-2 text-xs rounded-xl glass border border-border/20 focus:border-primary/40 focus:outline-none resize-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Bounty */}
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Bounty Amount ($)</p>
            <input
              type="number"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 text-xs rounded-xl glass border border-border/20 focus:border-primary/40 focus:outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="text-[10px] font-mono text-muted-foreground/30 break-all mt-2">ID: {report.id}</div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-border/20 flex flex-col gap-2 flex-shrink-0" style={{ background: "hsl(var(--muted)/0.08)" }}>
          <button onClick={saveNotes} disabled={saving}
            className="w-full py-2 rounded-xl text-xs font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save Notes & Bounty"}
          </button>
          <div className="flex gap-2">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                disabled={report.status === s || saving}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  report.status === s
                    ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border border-current/30`
                    : "glass text-muted-foreground hover:text-foreground border border-border/20"
                } disabled:cursor-not-allowed`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AdminBugBounty() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSev, setFilterSev] = useState<Severity | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<BugReport | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReports(data as unknown as BugReport[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("bug-reports-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bug_reports" }, (payload) => {
        setReports((prev) => [payload.new as unknown as BugReport, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bug_reports" }, (payload) => {
        setReports((prev) => prev.map((r) => r.id === (payload.new as BugReport).id ? payload.new as unknown as BugReport : r));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const handleUpdate = (updated: BugReport) => {
    setReports((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    setSelected(updated);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("bug_reports").delete().eq("id", id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = reports.filter((r) => {
    if (filterSev !== "all" && r.severity !== filterSev) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return [r.title, r.description, r.category, r.reporter_name, r.affected_url]
        .some((v) => v?.toLowerCase().includes(s));
    }
    return true;
  });

  const stats = {
    total: reports.length,
    open: reports.filter((r) => r.status === "open").length,
    critical: reports.filter((r) => r.severity === "critical").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      {/* Drawer */}
      {selected && (
        <BugDrawer report={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />
      )}

      {/* Submit form modal */}
      {showForm && <SubmitForm onClose={() => setShowForm(false)} onSubmit={(r) => { setReports((prev) => [r, ...prev]); setShowForm(false); }} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text">Bug Bounty Board</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Incoming vulnerability reports from the Ghost community</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)}
            className="btn-glow flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white">
            <Plus className="w-3.5 h-3.5" /> Submit Report
          </button>
          <button onClick={load} className="glass p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Reports", value: stats.total,    icon: Bug,          color: "text-primary",     bg: "bg-primary/10" },
          { label: "Open",          value: stats.open,     icon: Activity,     color: "text-secondary",   bg: "bg-secondary/10" },
          { label: "Critical",      value: stats.critical, icon: Zap,          color: "text-red-400",     bg: "bg-red-400/10" },
          { label: "Resolved",      value: stats.resolved, icon: CheckCircle2, color: "text-primary",     bg: "bg-primary/10" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-4 border border-border/20">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-black">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports…"
            className="w-full pl-8 pr-4 py-2 rounded-xl glass text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 border border-border/20 transition-colors"
          />
        </div>
        {/* Severity filter */}
        <div className="flex gap-1">
          {(["all", "critical", "high", "medium", "low", "info"] as const).map((s) => (
            <button key={s} onClick={() => setFilterSev(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                filterSev === s
                  ? s === "all" ? "bg-primary/20 text-primary border border-primary/30" : `${SEVERITY_CONFIG[s as Severity]?.bg} ${SEVERITY_CONFIG[s as Severity]?.color} ${SEVERITY_CONFIG[s as Severity]?.border} border`
                  : "glass text-muted-foreground border border-border/20 hover:text-foreground"
              }`}>
              {s === "all" ? "All Sev." : SEVERITY_CONFIG[s as Severity].label}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <div className="flex gap-1">
          {(["all", "open", "triaging", "confirmed", "resolved", "wont-fix"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                filterStatus === s
                  ? s === "all" ? "bg-secondary/20 text-secondary border border-secondary/30" : `${STATUS_CONFIG[s as Status]?.bg} ${STATUS_CONFIG[s as Status]?.color} border border-current/20`
                  : "glass text-muted-foreground border border-border/20 hover:text-foreground"
              }`}>
              {s === "all" ? "All Status" : STATUS_CONFIG[s as Status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports table */}
      <div className="rounded-2xl border border-border/30 overflow-hidden">
        {/* Thead */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-2.5 bg-muted/10 text-xs text-muted-foreground font-medium border-b border-border/20">
          <span>Sev.</span>
          <span>Report</span>
          <span className="hidden md:block">Category</span>
          <span className="hidden lg:block">CVSS</span>
          <span>Status</span>
          <span>Age</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading reports…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <Bug className="w-10 h-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">{search || filterSev !== "all" || filterStatus !== "all" ? "No matching reports" : "No bug reports yet"}</p>
            <p className="text-xs text-muted-foreground/50">Reports submitted via Ghost Chat will appear here in realtime</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((r, i) => {
              const sev = SEVERITY_CONFIG[r.severity];
              const sta = STATUS_CONFIG[r.status];
              const SevIcon = sev.icon;
              return (
                <motion.div key={r.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.012 }}
                  className="border-b border-border/10 last:border-0 group">
                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3">
                    {/* Severity badge */}
                    <div className={`w-7 h-7 rounded-lg ${sev.bg} flex items-center justify-center border ${sev.border}`}>
                      <SevIcon className={`w-3.5 h-3.5 ${sev.color}`} />
                    </div>

                    {/* Title + reporter */}
                    <button onClick={() => setSelected(r)} className="text-left min-w-0 hover:text-primary transition-colors group/btn">
                      <div className="font-semibold text-xs truncate group-hover/btn:text-primary">{r.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {r.reporter_name ?? "Anonymous"}
                        {r.affected_url && <span className="ml-2 opacity-60">{r.affected_url}</span>}
                      </div>
                    </button>

                    {/* Category */}
                    <span className="hidden md:block text-[10px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground font-mono">{r.category}</span>

                    {/* CVSS */}
                    <span className={`hidden lg:block text-xs font-mono font-bold ${r.cvss_score != null ? (r.cvss_score >= 9 ? "text-red-400" : r.cvss_score >= 7 ? "text-orange-400" : r.cvss_score >= 4 ? "text-yellow-400" : "text-blue-400") : "text-muted-foreground/40"}`}>
                      {r.cvss_score ?? "—"}
                    </span>

                    {/* Status */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${sta.bg} ${sta.color}`}>{sta.label}</span>

                    {/* Age + actions */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="font-mono whitespace-nowrap">{relTime(r.created_at)}</span>
                      <button onClick={() => handleDelete(r.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-destructive ml-1">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      <div className="text-xs text-muted-foreground">{filtered.length} reports shown</div>
    </div>
  );
}

// ── Submit Form Modal ──────────────────────────────────────────────────────────
function SubmitForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: BugReport) => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", severity: "medium" as Severity, category: "Other",
    reporter_name: "", reporter_contact: "", affected_url: "", steps_to_reproduce: "",
    expected_behavior: "", actual_behavior: "", proof_of_concept: "", cvss_score: "",
  });

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const INPUT = "w-full px-3 py-2 rounded-xl glass text-xs border border-border/20 focus:border-primary/40 focus:outline-none transition-colors placeholder:text-muted-foreground";

  const submit = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    const { data } = await supabase.from("bug_reports").insert({
      title: form.title,
      description: form.description,
      severity: form.severity,
      category: form.category,
      reporter_name: form.reporter_name || null,
      reporter_contact: form.reporter_contact || null,
      affected_url: form.affected_url || null,
      steps_to_reproduce: form.steps_to_reproduce || null,
      expected_behavior: form.expected_behavior || null,
      actual_behavior: form.actual_behavior || null,
      proof_of_concept: form.proof_of_concept || null,
      cvss_score: form.cvss_score ? parseFloat(form.cvss_score) : null,
    }).select().single();
    if (data) onSubmit(data as unknown as BugReport);
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="glass rounded-2xl border border-border/30 w-full max-w-lg max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm">Submit Bug Report</h3>
            </div>
            <button onClick={onClose} className="glass p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Brief vulnerability description" className={INPUT} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Severity</label>
                <select value={form.severity} onChange={(e) => set("severity", e.target.value as Severity)}
                  className={INPUT + " cursor-pointer"}>
                  {(["critical","high","medium","low","info"] as Severity[]).map((s) => (
                    <option key={s} value={s}>{SEVERITY_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Category</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)}
                  className={INPUT + " cursor-pointer"}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                rows={3} placeholder="Describe the vulnerability…" className={INPUT + " resize-none"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Your Name</label>
                <input value={form.reporter_name} onChange={(e) => set("reporter_name", e.target.value)} placeholder="Ghost Agent / Anonymous" className={INPUT} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Contact</label>
                <input value={form.reporter_contact} onChange={(e) => set("reporter_contact", e.target.value)} placeholder="email / @handle" className={INPUT} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Affected URL</label>
              <input value={form.affected_url} onChange={(e) => set("affected_url", e.target.value)} placeholder="https://…" className={INPUT} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Steps to Reproduce</label>
              <textarea value={form.steps_to_reproduce} onChange={(e) => set("steps_to_reproduce", e.target.value)}
                rows={3} placeholder="1. Navigate to…&#10;2. Enter payload…&#10;3. Observe…" className={INPUT + " resize-none"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Expected Behavior</label>
                <textarea value={form.expected_behavior} onChange={(e) => set("expected_behavior", e.target.value)} rows={2} placeholder="What should happen" className={INPUT + " resize-none"} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Actual Behavior</label>
                <textarea value={form.actual_behavior} onChange={(e) => set("actual_behavior", e.target.value)} rows={2} placeholder="What actually happens" className={INPUT + " resize-none"} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Proof of Concept</label>
              <textarea value={form.proof_of_concept} onChange={(e) => set("proof_of_concept", e.target.value)}
                rows={3} placeholder="Payload, curl command, code snippet…" className={INPUT + " resize-none font-mono text-[10px]"} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">CVSS Score (0–10)</label>
              <input type="number" min="0" max="10" step="0.1" value={form.cvss_score} onChange={(e) => set("cvss_score", e.target.value)} placeholder="e.g. 7.5" className={INPUT} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border/20 flex gap-2 flex-shrink-0">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl text-xs font-bold glass text-muted-foreground hover:text-foreground transition-colors border border-border/20">Cancel</button>
            <button onClick={submit} disabled={saving || !form.title || !form.description}
              className="flex-1 py-2 rounded-xl text-xs font-bold btn-glow text-white disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
