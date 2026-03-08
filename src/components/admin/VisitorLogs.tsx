import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye, Globe, Monitor, Smartphone, Tablet, Wifi, RefreshCw,
  Search, Download, Shield, MapPin, Clock, Cpu, Database,
  Hash, Flag, Activity, X, AlertTriangle, ChevronRight,
  ChevronDown, ExternalLink, Fingerprint, Radio, Languages,
  MemoryStick, ScanLine, Info
} from "lucide-react";
import { countryCodeToFlag } from "@/lib/flagEmoji";

// ── Types ─────────────────────────────────────────────────────────────────────
interface VisitorLog {
  id: string;
  visited_at: string;
  ip_address: string | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  isp: string | null;
  asn: string | null;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  os_version: string | null;
  device_type: string | null;
  is_mobile: boolean | null;
  is_bot: boolean | null;
  screen_width: number | null;
  screen_height: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  color_depth: number | null;
  pixel_ratio: number | null;
  timezone: string | null;
  timezone_offset: number | null;
  language: string | null;
  languages: string[] | null;
  page_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  connection_type: string | null;
  hardware_concurrency: number | null;
  device_memory: number | null;
  do_not_track: string | null;
  cookies_enabled: boolean | null;
  fingerprint: string | null;
  user_agent: string | null;
  raw_headers: Record<string, string> | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
};

const DeviceIcon = ({ type }: { type: string | null }) => {
  if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (type === "tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
};

// ── Visitor Detail Drawer ──────────────────────────────────────────────────────
function VisitorDrawer({ v, onClose }: { v: VisitorLog; onClose: () => void }) {
  const flag = v.country_code ? countryCodeToFlag(v.country_code) : "🌐";
  const [headersOpen, setHeadersOpen] = useState(false);

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="mb-5">
      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 pb-1.5 border-b border-border/20">
        <Icon className="w-3.5 h-3.5 text-primary" />
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );

  const Row = ({ label, value, mono = false, accent = false }: { label: string; value: string | null | undefined; mono?: boolean; accent?: boolean }) => {
    if (value == null || value === "") return null;
    return (
      <div className="flex items-start justify-between gap-3 text-xs py-0.5">
        <span className="text-muted-foreground shrink-0 w-32">{label}</span>
        <span className={`text-right break-all ${mono ? "font-mono" : ""} ${accent ? "text-primary font-semibold" : "text-foreground"}`}>
          {value}
        </span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col border-l border-border/30"
        style={{ background: "hsl(var(--card))", backdropFilter: "blur(20px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20 flex-shrink-0">
          <span className="text-3xl leading-none">{flag}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm truncate">{v.ip_address ?? "Unknown IP"}</span>
              {v.is_bot && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-bold border border-destructive/30">
                  🤖 BOT
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {[v.city, v.region, v.country].filter(Boolean).join(", ") || "Unknown location"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timestamp badge */}
        <div className="px-5 py-2.5 border-b border-border/10 flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0" style={{ background: "hsl(var(--muted)/0.2)" }}>
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>{new Date(v.visited_at).toLocaleString()}</span>
          <span className="ml-auto text-secondary font-mono font-bold">{relTime(v.visited_at)}</span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">

          {/* Network & Location */}
          <Section title="Network & Location" icon={Globe}>
            <Row label="IP Address" value={v.ip_address} mono accent />
            <Row label="Country" value={v.country ? `${flag} ${v.country}` : null} />
            <Row label="Country Code" value={v.country_code} mono />
            <Row label="Region" value={v.region} />
            <Row label="City" value={v.city} />
            <Row label="ISP" value={v.isp} />
            <Row label="ASN" value={v.asn} mono />
          </Section>

          {/* Browser & OS */}
          <Section title="Browser & OS" icon={Monitor}>
            <Row label="Browser" value={v.browser} />
            <Row label="Browser Ver." value={v.browser_version} mono />
            <Row label="OS" value={v.os} />
            <Row label="OS Version" value={v.os_version} mono />
            <Row label="Device Type" value={v.device_type} />
            <Row label="Mobile" value={v.is_mobile != null ? (v.is_mobile ? "Yes" : "No") : null} />
            <Row label="User Agent" value={v.user_agent} mono />
          </Section>

          {/* Screen & Display */}
          <Section title="Screen & Display" icon={ScanLine}>
            <Row label="Screen" value={v.screen_width && v.screen_height ? `${v.screen_width} × ${v.screen_height}` : null} mono />
            <Row label="Viewport" value={v.viewport_width && v.viewport_height ? `${v.viewport_width} × ${v.viewport_height}` : null} mono />
            <Row label="Color Depth" value={v.color_depth ? `${v.color_depth} bit` : null} mono />
            <Row label="Pixel Ratio" value={v.pixel_ratio ? `${v.pixel_ratio}x` : null} mono />
          </Section>

          {/* Language & Locale */}
          <Section title="Language & Locale" icon={Languages}>
            <Row label="Language" value={v.language} />
            <Row label="All Languages" value={v.languages?.join(", ") ?? null} />
            <Row label="Timezone" value={v.timezone} mono />
            <Row label="UTC Offset" value={v.timezone_offset != null ? `${v.timezone_offset > 0 ? "-" : "+"}${Math.abs(v.timezone_offset) / 60}h` : null} mono />
          </Section>

          {/* Traffic Source */}
          <Section title="Traffic Source" icon={ExternalLink}>
            <Row label="Page URL" value={v.page_url} mono />
            <Row label="Referrer" value={v.referrer || "Direct / None"} />
            <Row label="UTM Source" value={v.utm_source} />
            <Row label="UTM Medium" value={v.utm_medium} />
            <Row label="UTM Campaign" value={v.utm_campaign} />
          </Section>

          {/* Hardware */}
          <Section title="Hardware" icon={Cpu}>
            <Row label="CPU Cores" value={v.hardware_concurrency?.toString() ?? null} mono />
            <Row label="Device Memory" value={v.device_memory ? `${v.device_memory} GB` : null} mono />
            <Row label="Connection" value={v.connection_type} />
          </Section>

          {/* Privacy & Security */}
          <Section title="Privacy & Security" icon={Shield}>
            <Row label="Do Not Track" value={v.do_not_track} />
            <Row label="Cookies" value={v.cookies_enabled != null ? (v.cookies_enabled ? "Enabled" : "Disabled") : null} />
            <Row label="Bot Detected" value={v.is_bot != null ? (v.is_bot ? "⚠️ Yes — Bot" : "No") : null} accent={!!v.is_bot} />
          </Section>

          {/* Fingerprint */}
          <Section title="Fingerprint" icon={Fingerprint}>
            <div className="font-mono text-xs break-all text-primary/80 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              {v.fingerprint ?? "—"}
            </div>
          </Section>

          {/* Raw Headers accordion */}
          {v.raw_headers && Object.keys(v.raw_headers).length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setHeadersOpen(!headersOpen)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-mono w-full py-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{headersOpen ? "Hide" : "Show"} raw headers ({Object.keys(v.raw_headers).length})</span>
                <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${headersOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {headersOpen && (
                  <motion.pre
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 p-3 rounded-xl text-[10px] font-mono text-secondary/80 overflow-x-auto max-h-52 scrollbar-thin border border-border/20"
                    style={{ background: "hsl(0 0% 3%)" }}
                  >
                    {JSON.stringify(v.raw_headers, null, 2)}
                  </motion.pre>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Record ID */}
          <div className="text-[10px] font-mono text-muted-foreground/30 break-all mt-2">
            ID: {v.id}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/20 flex-shrink-0" style={{ background: "hsl(var(--muted)/0.1)" }}>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>visitor_logs • {v.id.slice(0, 8)}…</span>
            <span className="ml-auto">{new Date(v.visited_at).toISOString()}</span>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface VisitorLogsProps {
  countryFilter?: string | null;
}

export function VisitorLogs({ countryFilter }: VisitorLogsProps) {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorLog | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("visitor_logs")
      .select("*")
      .order("visited_at", { ascending: false })
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1);
    if (data) setLogs(data as unknown as VisitorLog[]);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Realtime — new rows slide in at top
  useEffect(() => {
    const channel = supabase
      .channel("visitor-logs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitor_logs" }, (payload) => {
        setLogs((prev) => [payload.new as unknown as VisitorLog, ...prev].slice(0, PER_PAGE));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = logs.filter((l) => {
    // Country filter from map click
    if (countryFilter && l.country_code !== countryFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return [l.ip_address, l.country, l.city, l.browser, l.os, l.device_type, l.fingerprint, l.page_url]
      .some((v) => v?.toLowerCase().includes(s));
  });

  const exportCSV = () => {
    const headers = Object.keys(logs[0] ?? {});
    const rows = filtered.map((l) =>
      headers.map((h) => {
        const v = (l as unknown as Record<string, unknown>)[h];
        if (v == null) return "";
        const s = String(v).replace(/"/g, '""');
        return s.includes(",") || s.includes('"') ? `"${s}"` : s;
      }).join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `visitor-intel-${Date.now()}.csv`;
    a.click();
  };

  const unique_ips = new Set(logs.map((l) => l.ip_address)).size;
  const countries  = new Set(logs.map((l) => l.country).filter(Boolean)).size;
  const bots       = logs.filter((l) => l.is_bot).length;
  const mobiles    = logs.filter((l) => l.is_mobile).length;

  return (
    <div className="space-y-6">
      {/* Visitor detail drawer */}
      {selectedVisitor && (
        <VisitorDrawer v={selectedVisitor} onClose={() => setSelectedVisitor(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text">Visitor Intelligence</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time forensic logs — click any row for full details</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="glass p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={exportCSV} disabled={logs.length === 0} className="glass flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-secondary transition-colors disabled:opacity-40">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Country filter banner */}
      {countryFilter && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-xs"
        >
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-primary font-bold">Filtered by country: {countryCodeToFlag(countryFilter)} {logs.find((l) => l.country_code === countryFilter)?.country ?? countryFilter}</span>
          <span className="text-muted-foreground ml-1">({filtered.length} visitors)</span>
          <span className="ml-auto text-muted-foreground/60 text-[10px]">Change filter from Analytics → World Map</span>
        </motion.div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Visits",  value: logs.length,  icon: Eye,           color: "text-primary"     },
          { label: "Unique IPs",    value: unique_ips,   icon: Hash,          color: "text-secondary"   },
          { label: "Countries",     value: countries,    icon: Globe,         color: "text-blue-400"    },
          { label: "Bots Detected", value: bots,         icon: AlertTriangle, color: "text-destructive" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl p-3 flex items-center gap-3">
            <Icon className={`w-4 h-4 ${color}`} />
            <div>
              <div className="text-xl font-black">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Device breakdown bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Device Split</span>
          <span className="text-xs text-muted-foreground">{mobiles} mobile • {logs.length - mobiles} desktop</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-muted/30">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: logs.length ? `${(mobiles / logs.length) * 100}%` : "0%", background: "var(--gradient-primary)" }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by IP, country, browser, fingerprint…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/30 overflow-hidden">
        {/* Thead */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-2.5 bg-muted/10 text-xs text-muted-foreground font-medium border-b border-border/20">
          <span></span>
          <span>Visitor</span>
          <span className="hidden md:block">Browser / OS</span>
          <span className="hidden lg:block">Screen</span>
          <span className="hidden md:block">Connection</span>
          <span>Time</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading intel…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Eye className="w-8 h-8 opacity-30" />
            <p>{search ? "No matching visitors found" : "No visitors logged yet — visit your portfolio to seed data."}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((v, i) => {
              const flag = v.country_code ? countryCodeToFlag(v.country_code) : "🌐";
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.012 }}
                  className="border-b border-border/10 last:border-0"
                >
                  <button
                    onClick={() => setSelectedVisitor(v)}
                    className="w-full grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors group"
                  >
                    {/* Flag */}
                    <span className="text-lg leading-none w-6">{flag}</span>

                    {/* IP + location */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-foreground">{v.ip_address ?? "Unknown IP"}</span>
                        {v.is_bot && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-medium">BOT</span>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {[v.city, v.region, v.country].filter(Boolean).join(", ") || "Unknown location"}
                        {v.isp && <span className="ml-2 opacity-60">{v.isp}</span>}
                      </div>
                    </div>

                    {/* Browser / OS */}
                    <div className="hidden md:block text-xs text-right">
                      <div className="text-foreground">{v.browser} {v.browser_version}</div>
                      <div className="text-muted-foreground">{v.os} {v.os_version}</div>
                    </div>

                    {/* Screen */}
                    <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
                      <DeviceIcon type={v.device_type} />
                      <span>{v.screen_width && v.screen_height ? `${v.screen_width}×${v.screen_height}` : "—"}</span>
                    </div>

                    {/* Connection */}
                    <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                      <Wifi className="w-3 h-3" />
                      <span>{v.connection_type ?? "—"}</span>
                    </div>

                    {/* Time + open hint */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{relTime(v.visited_at)}</span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} records shown</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="glass px-3 py-1.5 rounded-lg disabled:opacity-40 hover:text-primary transition-colors">
            ← Prev
          </button>
          <span className="glass px-3 py-1.5 rounded-lg">Page {page + 1}</span>
          <button onClick={() => setPage(page + 1)} disabled={logs.length < PER_PAGE}
            className="glass px-3 py-1.5 rounded-lg disabled:opacity-40 hover:text-primary transition-colors">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
