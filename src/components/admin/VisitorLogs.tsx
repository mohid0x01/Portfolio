import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye, Globe, Monitor, Smartphone, Tablet, Wifi, RefreshCw,
  ChevronDown, ChevronUp, Search, Download, Shield, MapPin,
  Clock, Cpu, Database, Hash, Flag, Activity, X, AlertTriangle
} from "lucide-react";

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
  raw_headers: Record<string, string> | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const flag = (cc: string | null) =>
  cc ? cc.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0))) : "🌐";

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

// ── Expanded row ──────────────────────────────────────────────────────────────
function ExpandedRow({ v }: { v: VisitorLog }) {
  const [headersOpen, setHeadersOpen] = useState(false);
  const rows: [string, string | null | undefined, React.ReactNode?][] = [
    ["IP Address",       v.ip_address,       <Hash className="w-3 h-3" />],
    ["Country",          v.country ? `${flag(v.country_code)} ${v.country}` : null, <Flag className="w-3 h-3" />],
    ["Region / City",    [v.region, v.city].filter(Boolean).join(", ") || null, <MapPin className="w-3 h-3" />],
    ["ISP / ASN",        [v.isp, v.asn].filter(Boolean).join("  •  ") || null, <Globe className="w-3 h-3" />],
    ["Browser",          v.browser ? `${v.browser} ${v.browser_version}` : null, <Eye className="w-3 h-3" />],
    ["OS",               v.os ? `${v.os} ${v.os_version}` : null, <Monitor className="w-3 h-3" />],
    ["Device Type",      v.device_type, <DeviceIcon type={v.device_type} />],
    ["Screen",           v.screen_width ? `${v.screen_width}×${v.screen_height} (${v.color_depth}bit @ ${v.pixel_ratio}x)` : null, <Activity className="w-3 h-3" />],
    ["Viewport",         v.viewport_width ? `${v.viewport_width}×${v.viewport_height}` : null, <Activity className="w-3 h-3" />],
    ["Timezone",         v.timezone ? `${v.timezone} (UTC${v.timezone_offset !== null && v.timezone_offset !== undefined ? (v.timezone_offset > 0 ? `-${v.timezone_offset/60}` : `+${Math.abs(v.timezone_offset)/60}`) : ""})` : null, <Clock className="w-3 h-3" />],
    ["Language",         v.language, <Globe className="w-3 h-3" />],
    ["All Languages",    v.languages?.join(", ") || null, <Globe className="w-3 h-3" />],
    ["Page URL",         v.page_url, <Activity className="w-3 h-3" />],
    ["Referrer",         v.referrer || "Direct", <Activity className="w-3 h-3" />],
    ["UTM",              v.utm_source ? `src:${v.utm_source} med:${v.utm_medium} cam:${v.utm_campaign}` : null, <Activity className="w-3 h-3" />],
    ["Connection",       v.connection_type, <Wifi className="w-3 h-3" />],
    ["CPU Cores",        v.hardware_concurrency?.toString(), <Cpu className="w-3 h-3" />],
    ["Device Memory",    v.device_memory ? `${v.device_memory} GB` : null, <Database className="w-3 h-3" />],
    ["Do Not Track",     v.do_not_track, <Shield className="w-3 h-3" />],
    ["Cookies",          v.cookies_enabled ? "Enabled" : "Disabled", <Shield className="w-3 h-3" />],
    ["Fingerprint",      v.fingerprint, <Hash className="w-3 h-3" />],
    ["Bot?",             v.is_bot ? "⚠️ Bot detected" : "No", <AlertTriangle className="w-3 h-3" />],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 text-xs font-mono border-t border-border/20">
        {rows.map(([label, val, icon]) =>
          val !== null && val !== undefined ? (
            <div key={label} className="flex items-start gap-1.5">
              <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
              <span className="text-muted-foreground shrink-0">{label}:</span>
              <span className="text-foreground break-all">{val}</span>
            </div>
          ) : null
        )}
      </div>

      {/* Raw headers accordion */}
      {v.raw_headers && Object.keys(v.raw_headers).length > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setHeadersOpen(!headersOpen)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
          >
            {headersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {headersOpen ? "Hide" : "Show"} raw headers ({Object.keys(v.raw_headers).length})
          </button>
          <AnimatePresence>
            {headersOpen && (
              <motion.pre
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 rounded-lg bg-black/30 text-xs font-mono text-secondary/80 overflow-x-auto max-h-48 scrollbar-thin"
              >
                {JSON.stringify(v.raw_headers, null, 2)}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function VisitorLogs() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;

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

  // Realtime subscription
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
    if (!search) return true;
    const s = search.toLowerCase();
    return [l.ip_address, l.country, l.city, l.browser, l.os, l.device_type, l.fingerprint, l.page_url]
      .some((v) => v?.toLowerCase().includes(s));
  });

  const exportCSV = () => {
    const headers = ["visited_at","ip_address","country","city","browser","os","device_type","page_url","referrer","fingerprint"];
    const rows = filtered.map((l) =>
      headers.map((h) => JSON.stringify((l as unknown as Record<string,unknown>)[h] ?? "")).join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `visitor-logs-${Date.now()}.csv`;
    a.click();
  };

  // Stats
  const unique_ips   = new Set(logs.map((l) => l.ip_address)).size;
  const countries    = new Set(logs.map((l) => l.country).filter(Boolean)).size;
  const bots         = logs.filter((l) => l.is_bot).length;
  const mobiles      = logs.filter((l) => l.is_mobile).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Visitor Intelligence</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time forensic visitor logs with full device & network fingerprints</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="glass p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={exportCSV} className="glass flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-secondary transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Visits",    value: logs.length, icon: Eye,    color: "text-primary"   },
          { label: "Unique IPs",      value: unique_ips,  icon: Hash,   color: "text-secondary" },
          { label: "Countries",       value: countries,   icon: Globe,  color: "text-blue-400"  },
          { label: "Bots Detected",   value: bots,        icon: AlertTriangle, color: "text-destructive" },
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

      {/* Mobile vs Desktop mini bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Device Breakdown</span>
          <span className="text-xs text-muted-foreground">{mobiles} mobile • {logs.length - mobiles} desktop</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-muted/30">
          <div
            className="h-full rounded-full"
            style={{
              width: logs.length ? `${(mobiles / logs.length) * 100}%` : "0%",
              background: "var(--gradient-primary)"
            }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by IP, country, browser, fingerprint..."
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
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading intelligence...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Eye className="w-8 h-8 opacity-30" />
            <p>{search ? "No matching visitors found" : "No visitors logged yet. Visit your portfolio to see data appear here."}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015 }}
                className="border-b border-border/10 last:border-0"
              >
                {/* Row */}
                <button
                  onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                  className="w-full grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3 text-left hover:bg-muted/10 transition-colors"
                >
                  {/* Flag */}
                  <span className="text-lg leading-none w-6">{flag(v.country_code)}</span>

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
                    <span>{v.screen_width && v.screen_height ? `${v.screen_width}×${v.screen_height}` : "-"}</span>
                  </div>

                  {/* Connection */}
                  <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                    <Wifi className="w-3 h-3" />
                    <span>{v.connection_type ?? "-"}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {relTime(v.visited_at)}
                    {expanded === v.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {expanded === v.id && <ExpandedRow v={v} />}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} records shown</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="glass px-3 py-1.5 rounded-lg disabled:opacity-40 hover:text-primary transition-colors"
          >
            ← Prev
          </button>
          <span className="glass px-3 py-1.5 rounded-lg">Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={logs.length < PER_PAGE}
            className="glass px-3 py-1.5 rounded-lg disabled:opacity-40 hover:text-primary transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
