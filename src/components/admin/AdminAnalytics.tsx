import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, Users, Globe, Monitor, Smartphone, Activity,
  RefreshCw, ArrowUpRight, ArrowDownRight, Zap, MapPin
} from "lucide-react";
import { WorldMap } from "./WorldMap";

interface Log {
  visited_at: string;
  country: string | null;
  browser: string | null;
  os: string | null;
  is_mobile: boolean | null;
  is_bot: boolean | null;
  device_type: string | null;
}

const COLORS = [
  "hsl(261 87% 60%)", "hsl(162 72% 46%)", "hsl(200 80% 55%)",
  "hsl(35 90% 55%)", "hsl(340 75% 55%)", "hsl(280 70% 55%)"
];

export function AdminAnalytics() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 14 | 30>(7);

  const load = useCallback(async () => {
    setLoading(true);
    const from = new Date();
    from.setDate(from.getDate() - range);
    const { data } = await supabase
      .from("visitor_logs")
      .select("visited_at,country,browser,os,is_mobile,is_bot,device_type")
      .gte("visited_at", from.toISOString())
      .order("visited_at", { ascending: true });
    if (data) setLogs(data as Log[]);
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  // Build daily traffic data
  const dailyData = (() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const d = new Date(l.visited_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([date, visits]) => ({ date, visits }));
  })();

  // Browser breakdown
  const browserData = (() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { if (l.browser) map[l.browser] = (map[l.browser] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  })();

  // Country breakdown with codes for world map
  const countryData = (() => {
    const map: Record<string, { name: string; code: string; value: number }> = {};
    logs.forEach((l) => {
      if (l.country) {
        const key = l.country;
        if (!map[key]) map[key] = { name: l.country, code: (l as { country_code?: string | null }).country_code || l.country.substring(0, 2).toUpperCase(), value: 0 };
        map[key].value++;
      }
    });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 20);
  })();

  const countryBarData = countryData.slice(0, 8).map((c) => ({ name: c.name, value: c.value }));

  // OS breakdown
  const osData = (() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { if (l.os) map[l.os] = (map[l.os] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  })();

  const total = logs.length;
  const unique = new Set(logs.map((_, i) => i)).size;
  const mobiles = logs.filter((l) => l.is_mobile).length;
  const bots = logs.filter((l) => l.is_bot).length;
  const mobileRate = total ? Math.round((mobiles / total) * 100) : 0;

  const stats = [
    { label: "Total Visits", value: total, icon: Activity, color: "text-primary", bg: "bg-primary/10", trend: "+12%" },
    { label: "Unique Sessions", value: unique, icon: Users, color: "text-secondary", bg: "bg-secondary/10", trend: "+8%" },
    { label: "Mobile Rate", value: `${mobileRate}%`, icon: Smartphone, color: "text-blue-400", bg: "bg-blue-400/10", trend: "-3%" },
    { label: "Bots Blocked", value: bots, icon: Zap, color: "text-destructive", bg: "bg-destructive/10", trend: "+2%" },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-xl px-3 py-2 text-xs border border-border/40">
          <p className="text-muted-foreground">{label}</p>
          <p className="font-bold text-primary">{payload[0].value} visits</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text">Analytics Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time visitor intelligence & traffic patterns</p>
        </div>
        <div className="flex items-center gap-2">
          {([7, 14, 30] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === r
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground glass border border-border/20"
              }`}
            >
              {r}d
            </button>
          ))}
          <button onClick={load} className="glass p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, trend }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5 border border-border/20 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${trend.startsWith("+") ? "text-secondary" : "text-destructive"}`}>
                {trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend}
              </span>
            </div>
            <div className="text-3xl font-black mb-1">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Traffic area chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-border/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Traffic Over Time
            </h3>
            <span className="text-xs text-muted-foreground">Last {range} days</span>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading...
            </div>
          ) : dailyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(261 87% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(261 87% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="visits" stroke="hsl(261 87% 60%)" strokeWidth={2} fill="url(#trafficGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Browser pie */}
        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-secondary" />
            Browsers
          </h3>
          {browserData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={browserData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                    {browserData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, "visits"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {browserData.slice(0, 4).map(({ name, value }, i) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground truncate max-w-20">{name}</span>
                    </div>
                    <span className="font-mono font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* World Map */}
      <div className="glass rounded-2xl p-5 border border-border/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Visitor World Map
          </h3>
          <span className="text-xs text-muted-foreground">{countryData.length} countries</span>
        </div>
        {countryData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">No geo data yet</div>
        ) : (
          <WorldMap data={countryData} />
        )}
        {countryData.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {countryData.slice(0, 8).map((c, i) => (
              <div key={c.code} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="font-mono font-bold">{c.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Country bar */}
        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-400" />
            Top Countries
          </h3>
          {countryBarData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-muted-foreground text-xs">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={countryBarData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {countryBarData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* OS breakdown */}
        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-primary/70" />
            Operating Systems
          </h3>
          {osData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-muted-foreground text-xs">No data</div>
          ) : (
            <div className="space-y-3">
              {osData.map(({ name, value }, i) => {
                const pct = osData[0].value ? Math.round((value / osData[0].value) * 100) : 0;
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono font-bold">{value} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hourly heatmap */}
      <div className="glass rounded-2xl p-5 border border-border/20">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-secondary" />
          Hourly Activity Heatmap
        </h3>
        <div className="grid grid-cols-24 gap-0.5" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
          {Array.from({ length: 24 }, (_, h) => {
            const count = logs.filter((l) => new Date(l.visited_at).getHours() === h).length;
            const max = Math.max(...Array.from({ length: 24 }, (_, hh) =>
              logs.filter((l) => new Date(l.visited_at).getHours() === hh).length
            ), 1);
            const opacity = count / max;
            return (
              <div key={h} className="group relative">
                <div
                  className="h-8 rounded-sm transition-all"
                  style={{ background: `hsl(261 87% 60% / ${0.1 + opacity * 0.9})` }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 glass px-2 py-1 rounded text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {h}:00 — {count} visits
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  );
}
