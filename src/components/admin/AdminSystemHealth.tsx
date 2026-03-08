import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cpu, HardDrive, MemoryStick, Wifi, Server, Database,
  Activity, Zap, ThermometerSun, Clock, CheckCircle2,
  AlertTriangle, TrendingUp, RefreshCw, Globe
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface Metric { t: string; v: number; }

function useMetric(min: number, max: number, base: number) {
  const [data, setData] = useState<Metric[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      t: String(i),
      v: base + Math.random() * (max - min) * 0.3,
    }))
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setData((d) => [
        ...d.slice(-19),
        { t: String(Date.now()), v: Math.max(min, Math.min(max, d[d.length - 1].v + (Math.random() - 0.48) * 8)) },
      ]);
    }, 1200);
    return () => clearInterval(interval);
  }, [min, max]);
  return data;
}

function MiniChart({ data, color }: { data: Metric[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`g-${color.replace(/[^a-z]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 10 }}
          formatter={(v: number) => [`${v.toFixed(1)}%`]}
        />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g-${color.replace(/[^a-z]/g, "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function GaugeRing({ value, max = 100, color, size = 80 }: { value: number; max?: number; color: string; size?: number }) {
  const pct = value / max;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
      <circle
        cx="32" cy="32" r={r} fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
        className="transition-all duration-700"
      />
      <text x="32" y="36" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{Math.round(value)}%</text>
    </svg>
  );
}

const SERVICES = [
  { name: "Web Server (Nginx)", status: "healthy", uptime: "99.98%", latency: "2ms", region: "US-East" },
  { name: "Database (Postgres)", status: "healthy", uptime: "99.99%", latency: "5ms", region: "US-East" },
  { name: "Auth Service", status: "healthy", uptime: "100%", latency: "8ms", region: "Global" },
  { name: "Edge Functions", status: "healthy", uptime: "99.95%", latency: "45ms", region: "Global" },
  { name: "CDN", status: "healthy", uptime: "100%", latency: "12ms", region: "Global" },
  { name: "Ghost Chat WS", status: "healthy", uptime: "99.9%", latency: "18ms", region: "EU-West" },
  { name: "File Storage", status: "degraded", uptime: "99.5%", latency: "120ms", region: "US-West" },
  { name: "Analytics Pipeline", status: "healthy", uptime: "99.97%", latency: "30ms", region: "US-East" },
];

export function AdminSystemHealth() {
  const cpuData = useMetric(10, 85, 35);
  const memData = useMetric(40, 80, 60);
  const diskData = useMetric(30, 70, 50);
  const netData = useMetric(5, 95, 40);

  const cpuVal = cpuData[cpuData.length - 1]?.v ?? 35;
  const memVal = memData[memData.length - 1]?.v ?? 60;
  const diskVal = diskData[diskData.length - 1]?.v ?? 50;
  const netVal = netData[netData.length - 1]?.v ?? 40;

  const getColor = (v: number) =>
    v > 80 ? "hsl(0 72% 51%)" : v > 60 ? "hsl(35 90% 55%)" : "hsl(162 72% 46%)";

  const metrics = [
    { label: "CPU", value: cpuVal, data: cpuData, icon: Cpu, unit: "%" },
    { label: "Memory", value: memVal, data: memData, icon: MemoryStick, unit: "%" },
    { label: "Disk I/O", value: diskVal, data: diskData, icon: HardDrive, unit: "%" },
    { label: "Network", value: netVal, data: netData, icon: Wifi, unit: "%" },
  ];

  const healthy = SERVICES.filter((s) => s.status === "healthy").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <Server className="w-6 h-6" />
            System Health
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time infrastructure monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary">All Systems {healthy}/{SERVICES.length} Healthy</span>
          </div>
        </div>
      </div>

      {/* Overall health */}
      <div className="glass rounded-2xl p-5 border border-border/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-secondary" />System Overview</h3>
          <span className="text-xs text-muted-foreground font-mono">Updated live</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map(({ label, value, data, icon: Icon }) => {
            const color = getColor(value);
            return (
              <div key={label} className="flex flex-col items-center">
                <GaugeRing value={value} color={color} />
                <div className="flex items-center gap-1.5 mt-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                <div className="w-full mt-2">
                  <MiniChart data={data} color={color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Server info */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-primary" />Server Info</h3>
          {[
            ["OS", "Ubuntu 22.04 LTS"],
            ["Kernel", "6.5.0-ghost"],
            ["Architecture", "x86_64"],
            ["CPU", "Intel Xeon (32c)"],
            ["RAM", "64 GB DDR5"],
            ["Storage", "4 TB NVMe"],
            ["Uptime", "15d 7h 23m"],
            ["Load Avg", "0.82, 0.91, 0.75"],
            ["Process", "247 running"],
            ["Users", "1 logged in"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0 text-xs">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-mono font-medium">{v}</span>
            </div>
          ))}
        </div>

        {/* Services */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" />Service Status</h3>
          <div className="space-y-2">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                {s.status === "healthy"
                  ? <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  : <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground">{s.region}</div>
                </div>
                <div className="flex items-center gap-4 text-xs flex-shrink-0">
                  <div className="text-right">
                    <div className="text-muted-foreground text-[10px]">Uptime</div>
                    <div className="font-mono font-bold text-secondary">{s.uptime}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground text-[10px]">Latency</div>
                    <div className={`font-mono font-bold ${parseInt(s.latency) > 50 ? "text-yellow-400" : "text-foreground"}`}>{s.latency}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    s.status === "healthy"
                      ? "bg-secondary/10 text-secondary border-secondary/20"
                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  }`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
