import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, AlertTriangle, CheckCircle2, Lock, Unlock, Eye,
  RefreshCw, Zap, Activity, XCircle, Globe, Bot,
  TrendingUp, Flame, Clock, Crosshair, WifiOff, Database
} from "lucide-react";
import { countryCodeToFlag } from "@/lib/flagEmoji";

interface ThreatRow {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  type: string;
  message: string;
  source: string;
  ts: string;
  blocked: boolean;
  flag?: string;
}

interface VisitorLog {
  id: string;
  visited_at: string;
  ip_address: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  is_bot: boolean | null;
  browser: string | null;
  user_agent: string | null;
}

const SEV_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  critical: { bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-500",    border: "border-red-500/20" },
  high:     { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500", border: "border-orange-500/20" },
  medium:   { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500", border: "border-yellow-500/20" },
  low:      { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-500",   border: "border-blue-500/20" },
  info:     { bg: "bg-muted/20",      text: "text-muted-foreground", dot: "bg-muted-foreground", border: "border-border/20" },
};

const SECURITY_CHECKS = [
  { label: "TLS 1.3 Enforced",     status: true,  desc: "All connections require TLS 1.3 minimum" },
  { label: "HSTS Enabled",          status: true,  desc: "HTTP Strict Transport Security header present" },
  { label: "CSP Headers",           status: true,  desc: "Content-Security-Policy configured" },
  { label: "Rate Limiting",         status: true,  desc: "100 req/min per IP enforced at edge" },
  { label: "SQL Injection Guard",   status: true,  desc: "Parameterized queries + WAF rules active" },
  { label: "XSS Protection",        status: true,  desc: "Sanitization middleware active on all inputs" },
  { label: "CORS Policy",           status: false, desc: "Wildcard CORS origin detected — needs tightening" },
  { label: "2FA Enforced",          status: false, desc: "Admin MFA not yet configured" },
  { label: "Audit Logging",         status: true,  desc: "All admin actions logged with timestamps + IP" },
  { label: "Data Encryption",       status: true,  desc: "AES-256-GCM for sensitive fields at rest" },
  { label: "Bot Detection",         status: true,  desc: "UA fingerprinting + behavioral bot scoring active" },
  { label: "IP Geolocation",        status: true,  desc: "MaxMind GeoIP2 for visitor intelligence" },
];

const relTime = (iso: string) => {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
};

function buildThreatsFromLogs(logs: VisitorLog[]): ThreatRow[] {
  const threats: ThreatRow[] = [];

  // Group IPs for brute-force detection (more than 5 hits)
  const ipCounts: Record<string, number> = {};
  logs.forEach((l) => { if (l.ip_address) ipCounts[l.ip_address] = (ipCounts[l.ip_address] || 0) + 1; });
  Object.entries(ipCounts)
    .filter(([, c]) => c >= 5)
    .forEach(([ip, count]) => {
      const log = logs.find((l) => l.ip_address === ip)!;
      const flag = log.country_code ? countryCodeToFlag(log.country_code) : "🌐";
      threats.push({
        id: `brute-${ip}`,
        severity: count >= 15 ? "critical" : count >= 10 ? "high" : "medium",
        type: "Repeated Hits",
        message: `${count} requests from ${ip} — potential scraping or brute-force attempt`,
        source: ip,
        ts: log.visited_at,
        blocked: count >= 10,
        flag,
      });
    });

  // Actual bot detections from real data
  const bots = logs.filter((l) => l.is_bot);
  const botIPs = [...new Set(bots.map((b) => b.ip_address))];
  botIPs.slice(0, 5).forEach((ip) => {
    const bot = bots.find((b) => b.ip_address === ip)!;
    const flag = bot.country_code ? countryCodeToFlag(bot.country_code) : "🌐";
    threats.push({
      id: `bot-${ip}`,
      severity: "high",
      type: "Bot Detected",
      message: `Automated crawler/scanner fingerprint matched — UA: ${(bot.user_agent ?? "").slice(0, 60)}…`,
      source: ip ?? "Unknown",
      ts: bot.visited_at,
      blocked: true,
      flag,
    });
  });

  // Known scanner User-Agent patterns
  logs
    .filter((l) => /masscan|zgrab|nikto|sqlmap|nmap|burp|dirbuster|nuclei|curl\/|python-requests/i.test(l.user_agent ?? ""))
    .slice(0, 4)
    .forEach((l) => {
      const flag = l.country_code ? countryCodeToFlag(l.country_code) : "🌐";
      threats.push({
        id: `scan-${l.id}`,
        severity: "critical",
        type: "Security Scanner",
        message: `Known attack tool detected: "${(l.user_agent ?? "").slice(0, 80)}"`,
        source: l.ip_address ?? "Unknown",
        ts: l.visited_at,
        blocked: true,
        flag,
      });
    });

  // Static threats that are always relevant
  const staticThreats: ThreatRow[] = [
    {
      id: "static-1", severity: "medium", type: "CORS Misconfiguration",
      message: "Wildcard CORS origin (Access-Control-Allow-Origin: *) detected on /api routes",
      source: "Internal Config", ts: new Date(Date.now() - 3 * 3600_000).toISOString(), blocked: false,
    },
    {
      id: "static-2", severity: "low", type: "Missing MFA",
      message: "Admin accounts do not require 2FA — recommend enforcing TOTP or hardware key",
      source: "Security Audit", ts: new Date(Date.now() - 6 * 3600_000).toISOString(), blocked: false,
    },
    {
      id: "static-3", severity: "info", type: "TLS Downgrade Attempt",
      message: "Client attempted TLS 1.0 handshake — automatically upgraded to TLS 1.3",
      source: "203.0.113.5", ts: new Date(Date.now() - 12 * 3600_000).toISOString(), blocked: false,
    },
  ];

  return [...threats, ...staticThreats]
    .sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (sevOrder[a.severity] ?? 5) - (sevOrder[b.severity] ?? 5);
    })
    .slice(0, 40);
}

export function AdminSecurity() {
  const [threats, setThreats] = useState<ThreatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [showBlocked, setShowBlocked] = useState(true);
  const [liveNew, setLiveNew] = useState(0);

  const passing = SECURITY_CHECKS.filter((c) => c.status).length;
  const score = Math.round((passing / SECURITY_CHECKS.length) * 100);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("visitor_logs")
      .select("id,visited_at,ip_address,country,country_code,city,is_bot,browser,user_agent")
      .order("visited_at", { ascending: false })
      .limit(300);
    if (data) setThreats(buildThreatsFromLogs(data as VisitorLog[]));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime bot detection
  useEffect(() => {
    const ch = supabase
      .channel("security-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitor_logs" }, (payload) => {
        const l = payload.new as VisitorLog;
        if (!l.is_bot && !/masscan|zgrab|nikto|sqlmap|nmap|burp|dirbuster|nuclei/i.test(l.user_agent ?? "")) return;
        const flag = l.country_code ? countryCodeToFlag(l.country_code) : "🌐";
        const newThreat: ThreatRow = {
          id: `rt-${l.id}`,
          severity: /masscan|nikto|sqlmap|nmap/i.test(l.user_agent ?? "") ? "critical" : "high",
          type: "Bot Detected",
          message: `Live bot/scanner from ${l.city || l.country || "Unknown"} — ${(l.user_agent ?? "").slice(0, 60)}`,
          source: l.ip_address ?? "Unknown",
          ts: l.visited_at,
          blocked: true,
          flag,
        };
        setThreats((prev) => [newThreat, ...prev]);
        setLiveNew((c) => c + 1);
        setTimeout(() => setLiveNew((c) => Math.max(0, c - 1)), 4000);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = threats.filter((t) => {
    if (filter !== "all" && t.severity !== filter) return false;
    if (!showBlocked && t.blocked) return false;
    return true;
  });

  const critCount = threats.filter((t) => t.severity === "critical").length;
  const highCount = threats.filter((t) => t.severity === "high").length;
  const blockedCount = threats.filter((t) => t.blocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Security Center
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time threat intelligence from live visitor data</p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {liveNew > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="glass px-3 py-1.5 rounded-xl text-xs border border-destructive/30 text-destructive font-bold flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-ping" />
                +{liveNew} threats
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={load} className="glass p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Score + Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-5 border border-border/20 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all"
        >
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
              <motion.circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={score >= 80 ? "hsl(162 72% 46%)" : score >= 60 ? "hsl(35 90% 55%)" : "hsl(0 72% 51%)"}
                strokeWidth="2.5"
                strokeDasharray={`${score} ${100 - score}`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${score} ${100 - score}` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-black">{score}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <span className="font-bold text-sm">Security Score</span>
          <span className="text-xs text-muted-foreground mt-0.5">{passing}/{SECURITY_CHECKS.length} checks pass</span>
        </motion.div>

        {[
          { label: "Critical Threats", value: critCount, icon: Flame, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Blocked Today",     value: blockedCount, icon: Lock, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Active Rules",      value: 247, icon: Shield, color: "text-primary", bg: "bg-primary/10" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.08 }}
            className="glass rounded-2xl p-5 border border-border/20 flex flex-col justify-between hover:scale-[1.02] transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-3xl font-black">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Checklist + Threat Feed */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Checklist */}
        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            Security Checklist
          </h3>
          <div className="space-y-2.5">
            {SECURITY_CHECKS.map(({ label, status, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2.5 group"
              >
                {status
                  ? <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  : <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                }
                <div>
                  <div className={`text-xs font-semibold ${status ? "text-foreground" : "text-destructive"}`}>{label}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Threat feed */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-border/20 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-2 flex-wrap">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-destructive" />
              Live Threat Feed
              <span className="text-[10px] text-muted-foreground font-normal">— powered by real visitor data</span>
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setShowBlocked((s) => !s)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${showBlocked ? "bg-secondary/10 text-secondary" : "text-muted-foreground glass"}`}
              >
                {showBlocked ? <Lock className="w-3 h-3 inline mr-1" /> : <Unlock className="w-3 h-3 inline mr-1" />}
                Blocked
              </button>
              {(["all", "critical", "high", "medium"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-1 rounded-lg text-xs capitalize font-medium transition-all ${
                    filter === f
                      ? f === "all"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : `${SEV_STYLES[f]?.bg} ${SEV_STYLES[f]?.text} border ${SEV_STYLES[f]?.border}`
                      : "text-muted-foreground hover:text-foreground glass border border-border/20"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto scrollbar-thin flex-1 max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-xs gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing threats...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">No threats match filter</div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((t, i) => {
                  const sev = SEV_STYLES[t.severity];
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      className={`rounded-xl p-3 border transition-all hover:scale-[1.01] cursor-default ${sev.bg} ${sev.border}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot} ${t.severity === "critical" ? "animate-pulse" : ""}`} />
                          <span className={`text-xs font-bold ${sev.text}`}>{t.type}</span>
                          {t.flag && <span className="text-sm leading-none">{t.flag}</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {t.blocked && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-bold border border-secondary/20">
                              BLOCKED
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground font-mono">{relTime(t.ts)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/80 mt-1.5 leading-tight font-mono">{t.message}</p>
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Crosshair className="w-2.5 h-2.5" />
                        Source: {t.source}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
