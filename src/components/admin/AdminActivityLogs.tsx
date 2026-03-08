import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, Clock, Globe, Monitor, Smartphone, Tablet,
  RefreshCw, TrendingUp, Users, Eye, MousePointer,
  ArrowUpRight, Filter, Search, Zap, MapPin, Bot,
  Chrome, Layers, Hash, Wifi
} from "lucide-react";
import { countryCodeToFlag } from "@/lib/flagEmoji";

interface Log {
  id: string;
  visited_at: string;
  ip_address: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  device_type: string | null;
  is_mobile: boolean | null;
  is_bot: boolean | null;
  page_url: string | null;
  referrer: string | null;
  fingerprint: string | null;
  connection_type: string | null;
}

const relTime = (iso: string) => {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
};

const DEVICE_ICON: Record<string, React.ElementType> = {
  mobile: Smartphone, tablet: Tablet
};
const DevIcon = ({ type }: { type: string | null }) => {
  const Icon = (type && DEVICE_ICON[type]) || Monitor;
  return <Icon className="w-3.5 h-3.5" />;
};

// Group sessions by fingerprint
function buildSessions(logs: Log[]) {
  const map = new Map<string, Log[]>();
  logs.forEach((l) => {
    const key = l.fingerprint ?? l.ip_address ?? l.id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(l);
  });
  return Array.from(map.entries())
    .map(([fp, ls]) => ({
      fp,
      count: ls.length,
      first: ls[ls.length - 1],
      last: ls[0],
      pages: [...new Set(ls.map((l) => l.page_url).filter(Boolean))],
    }))
    .sort((a, b) => new Date(b.last.visited_at).getTime() - new Date(a.last.visited_at).getTime());
}

export function AdminActivityLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "desktop" | "mobile" | "bot">("all");
  const [view, setView] = useState<"timeline" | "sessions">("timeline");
  const [liveCount, setLiveCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("visitor_logs")
      .select("id,visited_at,ip_address,country,country_code,city,browser,browser_version,os,device_type,is_mobile,is_bot,page_url,referrer,fingerprint,connection_type")
      .order("visited_at", { ascending: false })
      .limit(200);
    if (data) setLogs(data as Log[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    const ch = supabase
      .channel("activity-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitor_logs" }, (payload) => {
        setLogs((prev) => [payload.new as Log, ...prev].slice(0, 200));
        setLiveCount((c) => c + 1);
        setTimeout(() => setLiveCount((c) => Math.max(0, c - 1)), 3000);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = logs.filter((l) => {
    if (deviceFilter === "bot" && !l.is_bot) return false;
    if (deviceFilter === "mobile" && !l.is_mobile) return false;
    if (deviceFilter === "desktop" && (l.is_mobile || l.is_bot)) return false;
    if (search) {
      const s = search.toLowerCase();
      return [l.ip_address, l.country, l.city, l.browser, l.page_url, l.referrer, l.fingerprint]
        .some((v) => v?.toLowerCase().includes(s));
    }
    return true;
  });

  const sessions = buildSessions(filtered);
  const totalUnique = new Set(logs.map((l) => l.fingerprint ?? l.ip_address)).size;
  const botCount = logs.filter((l) => l.is_bot).length;
  const mobileCount = logs.filter((l) => l.is_mobile && !l.is_bot).length;
  const desktopCount = logs.filter((l) => !l.is_mobile && !l.is_bot).length;

  // Hourly activity data for sparkline
  const hourly: Record<number, number> = {};
  logs.forEach((l) => {
    const h = new Date(l.visited_at).getHours();
    hourly[h] = (hourly[h] || 0) + 1;
  });
  const peak = Math.max(...Object.values(hourly), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <Activity className="w-6 h-6" />
            User Activity Logs
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Real visitor sessions, page views & behavioral analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {liveCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-secondary/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                <span className="text-secondary font-bold">+{liveCount} new</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={load} className="glass p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions", value: logs.length, icon: Eye, color: "text-primary", bg: "bg-primary/10", glow: "hover:border-primary/40" },
          { label: "Unique Visitors", value: totalUnique, icon: Users, color: "text-secondary", bg: "bg-secondary/10", glow: "hover:border-secondary/40" },
          { label: "Human Traffic", value: desktopCount + mobileCount, icon: MousePointer, color: "text-blue-400", bg: "bg-blue-500/10", glow: "hover:border-blue-400/30" },
          { label: "Bot Hits", value: botCount, icon: Bot, color: "text-orange-400", bg: "bg-orange-500/10", glow: "hover:border-orange-400/30" },
        ].map(({ label, value, icon: Icon, color, bg, glow }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`glass rounded-2xl p-5 border border-border/20 transition-all duration-300 group cursor-default ${glow}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <ArrowUpRight className={`w-3.5 h-3.5 ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="text-3xl font-black mb-0.5">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Device split bar */}
      <div className="glass rounded-2xl p-5 border border-border/20">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Device Split</h3>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
          {desktopCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(desktopCount / logs.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary rounded-l-full"
            />
          )}
          {mobileCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(mobileCount / logs.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="h-full bg-secondary"
            />
          )}
          {botCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(botCount / logs.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-orange-500 rounded-r-full"
            />
          )}
        </div>
        <div className="flex gap-6 text-xs">
          {[
            { label: "Desktop", count: desktopCount, color: "bg-primary", textColor: "text-primary" },
            { label: "Mobile", count: mobileCount, color: "bg-secondary", textColor: "text-secondary" },
            { label: "Bots", count: botCount, color: "bg-orange-500", textColor: "text-orange-400" },
          ].map(({ label, count, color, textColor }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-muted-foreground">{label}</span>
              <span className={`font-mono font-bold ${textColor}`}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 24h heatmap */}
      <div className="glass rounded-2xl p-5 border border-border/20">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-primary" />
          24-Hour Activity Heatmap
        </h3>
        <div className="flex items-end gap-1 h-16">
          {Array.from({ length: 24 }, (_, h) => {
            const count = hourly[h] || 0;
            const heightPct = peak > 0 ? (count / peak) * 100 : 0;
            const isActive = new Date().getHours() === h;
            return (
              <motion.div
                key={h}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(heightPct, 3)}%` }}
                transition={{ duration: 0.6, delay: h * 0.025 }}
                title={`${h}:00 — ${count} visits`}
                className={`flex-1 rounded-t-sm cursor-help transition-all hover:opacity-80 ${
                  isActive
                    ? "bg-secondary shadow-[0_0_8px_hsl(162_72%_46%/0.5)]"
                    : count > peak * 0.7
                    ? "bg-primary/80"
                    : count > peak * 0.3
                    ? "bg-primary/40"
                    : "bg-primary/15"
                }`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono mt-1.5">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IP, country, browser, URL..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm border border-border/20 focus:border-primary/40 focus:outline-none transition-colors placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "desktop", "mobile", "bot"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setDeviceFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                deviceFilter === f
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "glass text-muted-foreground hover:text-foreground border border-border/20"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {(["timeline", "sessions"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                view === v
                  ? "bg-secondary/20 text-secondary border border-secondary/30"
                  : "glass text-muted-foreground hover:text-foreground border border-border/20"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      {view === "timeline" && (
        <div className="glass rounded-2xl border border-border/20 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Activity Timeline ({filtered.length} events)
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground/50">Newest first</span>
          </div>
          <div className="overflow-y-auto max-h-[520px] scrollbar-thin divide-y divide-border/10">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-xs gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading activity...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-xs">No activity found</div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((log, i) => {
                  const flag = log.country_code ? countryCodeToFlag(log.country_code) : "🌐";
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className={`flex items-center gap-3 px-5 py-3 hover:bg-muted/10 transition-colors group cursor-default ${
                        log.is_bot ? "border-l-2 border-orange-500/40" : ""
                      }`}
                    >
                      {/* Time */}
                      <div className="w-16 flex-shrink-0 text-right">
                        <span className="text-[10px] font-mono text-muted-foreground/60">{relTime(log.visited_at)}</span>
                      </div>

                      {/* Flag + location */}
                      <div className="w-32 flex-shrink-0 flex items-center gap-1.5">
                        <span className="text-base leading-none">{flag}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{log.city || log.country || "Unknown"}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{log.country || "—"}</div>
                        </div>
                      </div>

                      {/* IP */}
                      <div className="hidden sm:block w-28 flex-shrink-0">
                        <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate block">
                          {log.ip_address ?? "—"}
                        </span>
                      </div>

                      {/* Device + Browser */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={log.is_bot ? "text-orange-400" : "text-muted-foreground"}>
                          <DevIcon type={log.device_type} />
                        </span>
                        <span className="text-xs text-muted-foreground hidden md:block truncate max-w-20">{log.browser ?? "—"}</span>
                      </div>

                      {/* Page URL */}
                      <div className="flex-1 min-w-0 hidden lg:block">
                        <span className="text-[11px] text-muted-foreground/70 font-mono truncate block" title={log.page_url ?? ""}>
                          {log.page_url ? new URL(log.page_url).pathname : "—"}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {log.is_bot && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20">BOT</span>
                        )}
                        {log.is_mobile && !log.is_bot && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">MOB</span>
                        )}
                        {log.connection_type && (
                          <span className="text-[10px] font-mono text-muted-foreground/50 hidden xl:block">{log.connection_type}</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      {/* Sessions View */}
      {view === "sessions" && (
        <div className="space-y-2">
          {sessions.slice(0, 50).map((s, i) => {
            const flag = s.last.country_code ? countryCodeToFlag(s.last.country_code) : "🌐";
            return (
              <motion.div
                key={s.fp}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.6) }}
                className="glass rounded-2xl p-4 border border-border/20 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl leading-none flex-shrink-0">{flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold">{s.last.ip_address ?? "Unknown"}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {s.last.city ? `${s.last.city}, ` : ""}{s.last.country ?? "—"}
                      </span>
                      {s.last.is_bot && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20">BOT</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.pages.slice(0, 3).map((p) => (
                        <span key={p} className="text-[10px] font-mono text-muted-foreground/60 bg-muted/20 px-1.5 py-0.5 rounded">
                          {p ? new URL(p).pathname : "/"}
                        </span>
                      ))}
                      {s.pages.length > 3 && (
                        <span className="text-[10px] text-muted-foreground/40">+{s.pages.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground/50">Last seen</div>
                      <div className="text-xs font-mono font-bold text-secondary">{relTime(s.last.visited_at)}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-black text-primary">{s.count}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {sessions.length === 0 && (
            <div className="glass rounded-2xl p-12 border border-border/20 text-center text-muted-foreground text-xs">
              No sessions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
