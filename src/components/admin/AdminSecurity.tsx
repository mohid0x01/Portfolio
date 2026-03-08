import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle2, Lock, Unlock, Eye, EyeOff,
  Key, RefreshCw, Zap, Globe, Activity, TrendingUp, Clock,
  XCircle, Info, ChevronRight
} from "lucide-react";

interface ThreatItem {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  message: string;
  source: string;
  ts: string;
  blocked: boolean;
}

const MOCK_THREATS: ThreatItem[] = [
  { id: "1", type: "SQLi Attempt", severity: "critical", message: "SQL injection payload detected in /api/users?id=1' OR 1=1--", source: "192.168.1.55", ts: "2m ago", blocked: true },
  { id: "2", type: "XSS Attempt", severity: "high", message: "<script>alert(document.cookie)</script> in query param", source: "10.0.0.42", ts: "5m ago", blocked: true },
  { id: "3", type: "Brute Force", severity: "high", message: "23 failed login attempts from single IP in 60s", source: "45.33.32.156", ts: "12m ago", blocked: true },
  { id: "4", type: "Path Traversal", severity: "medium", message: "../../etc/passwd detected in file parameter", source: "172.16.0.99", ts: "28m ago", blocked: true },
  { id: "5", type: "Bot Detected", severity: "medium", message: "Automated scanner fingerprint matched (Masscan 1.3)", source: "185.220.101.45", ts: "1h ago", blocked: false },
  { id: "6", type: "CSRF Token Missing", severity: "low", message: "POST /api/profile missing CSRF token", source: "Internal", ts: "2h ago", blocked: false },
  { id: "7", type: "TLS Downgrade", severity: "info", message: "Client attempted TLS 1.0 connection — upgraded to TLS 1.3", source: "203.0.113.5", ts: "3h ago", blocked: false },
  { id: "8", type: "Rate Limit", severity: "medium", message: "API endpoint /api/search exceeded 100 req/min", source: "66.249.64.17", ts: "4h ago", blocked: true },
];

const SECURITY_CHECKS = [
  { label: "TLS 1.3 Enforced", status: true, desc: "All connections use TLS 1.3 minimum" },
  { label: "HSTS Enabled", status: true, desc: "HTTP Strict Transport Security header present" },
  { label: "CSP Headers", status: true, desc: "Content Security Policy configured" },
  { label: "Rate Limiting", status: true, desc: "100 req/min per IP enforced" },
  { label: "SQL Injection Guard", status: true, desc: "Parameterized queries + WAF rules active" },
  { label: "XSS Protection", status: true, desc: "Sanitization middleware active on all inputs" },
  { label: "CORS Configured", status: false, desc: "CORS policy needs tightening — wildcards detected" },
  { label: "2FA Required", status: false, desc: "Admin accounts should enforce MFA" },
  { label: "Audit Logging", status: true, desc: "All admin actions are logged with timestamps" },
  { label: "Data Encryption", status: true, desc: "AES-256-GCM for sensitive fields" },
];

const SEV_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
  high: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500" },
  low: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  info: { bg: "bg-muted/30", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export function AdminSecurity() {
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [showBlocked, setShowBlocked] = useState(true);

  const passing = SECURITY_CHECKS.filter((c) => c.status).length;
  const score = Math.round((passing / SECURITY_CHECKS.length) * 100);

  const filtered = MOCK_THREATS.filter((t) => {
    if (filter !== "all" && t.severity !== filter) return false;
    if (!showBlocked && t.blocked) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Security Center
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time threat detection & security posture</p>
        </div>
        <button className="glass px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />Refresh
        </button>
      </div>

      {/* Score + Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score ring */}
        <div className="lg:col-span-1 glass rounded-2xl p-5 border border-border/20 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={score >= 80 ? "hsl(162 72% 46%)" : score >= 60 ? "hsl(35 90% 55%)" : "hsl(0 72% 51%)"}
                strokeWidth="2.5"
                strokeDasharray={`${score} ${100 - score}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-black">{score}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <span className="font-bold text-sm">Security Score</span>
          <span className="text-xs text-muted-foreground mt-0.5">{passing}/{SECURITY_CHECKS.length} checks pass</span>
        </div>

        {[
          { label: "Threats Detected", value: MOCK_THREATS.length, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Blocked Today", value: MOCK_THREATS.filter((t) => t.blocked).length, icon: Lock, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Active Rules", value: 247, icon: Shield, color: "text-primary", bg: "bg-primary/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-2xl p-5 border border-border/20 flex flex-col justify-between">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-3xl font-black">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Security Checklist */}
        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            Security Checklist
          </h3>
          <div className="space-y-2.5">
            {SECURITY_CHECKS.map(({ label, status, desc }) => (
              <div key={label} className="flex items-start gap-2.5 group">
                {status
                  ? <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                }
                <div>
                  <div className={`text-xs font-semibold ${status ? "text-foreground" : "text-destructive"}`}>{label}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat feed */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-border/20 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-destructive" />
              Threat Feed
            </h3>
            <div className="flex items-center gap-2">
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
                  className={`px-2 py-1 rounded-lg text-xs capitalize font-medium transition-colors ${
                    filter === f
                      ? f === "all" ? "bg-primary/20 text-primary" : `${SEV_STYLES[f]?.bg} ${SEV_STYLES[f]?.text}`
                      : "text-muted-foreground hover:text-foreground glass"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 overflow-y-auto scrollbar-thin flex-1">
            {filtered.map((t, i) => {
              const sev = SEV_STYLES[t.severity];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-xl p-3 border border-border/10 ${sev.bg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                      <span className={`text-xs font-bold ${sev.text}`}>{t.type}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {t.blocked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-bold border border-secondary/20">
                          BLOCKED
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">{t.ts}</span>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1 leading-tight font-mono">{t.message}</p>
                  <div className="text-[10px] text-muted-foreground mt-1">Source: {t.source}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
