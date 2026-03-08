import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Wifi, Globe, Server, Cpu, HardDrive,
  TrendingUp, ArrowUp, ArrowDown, RefreshCw, Terminal,
  Database, Clock, Zap, Radio
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface DataPoint { t: string; in: number; out: number; latency: number; }
interface Request { id: string; method: string; path: string; status: number; size: string; time: string; ts: number; }

const METHOD_COLORS: Record<string, string> = {
  GET: "text-secondary",
  POST: "text-primary",
  PUT: "text-yellow-400",
  DELETE: "text-destructive",
  PATCH: "text-blue-400",
};

const STATUS_COLORS = (s: number) => {
  if (s >= 500) return "text-destructive bg-destructive/10";
  if (s >= 400) return "text-yellow-400 bg-yellow-400/10";
  if (s >= 300) return "text-blue-400 bg-blue-400/10";
  return "text-secondary bg-secondary/10";
};

const MOCK_PATHS = [
  "/api/visitor-logs", "/api/auth/session", "/api/ghost/rooms",
  "/api/ghost/messages", "/api/admin/stats", "/static/assets/main.js",
  "/api/projects", "/api/ghost/members", "/favicon.ico", "/api/health",
];

export function AdminNetworkMonitor() {
  const [traffic, setTraffic] = useState<DataPoint[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLive, setIsLive] = useState(true);
  const nextId = useRef(0);

  const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setTraffic((prev) => [...prev.slice(-29), { t: now, in: rnd(10, 250), out: rnd(5, 150), latency: rnd(8, 120) }]);

      // Add mock request
      const methods = ["GET", "GET", "GET", "POST", "PUT", "DELETE", "PATCH"];
      const statuses = [200, 200, 200, 201, 204, 304, 400, 401, 404, 500];
      const method = methods[rnd(0, methods.length)];
      const status = statuses[rnd(0, statuses.length)];
      setRequests((prev) => [
        {
          id: String(nextId.current++),
          method,
          path: MOCK_PATHS[rnd(0, MOCK_PATHS.length)],
          status,
          size: `${rnd(1, 200)}KB`,
          time: `${rnd(5, 500)}ms`,
          ts: Date.now(),
        },
        ...prev.slice(0, 49),
      ]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLive]);

  const totalIn = traffic.reduce((s, d) => s + d.in, 0);
  const totalOut = traffic.reduce((s, d) => s + d.out, 0);
  const avgLatency = traffic.length ? Math.round(traffic.reduce((s, d) => s + d.latency, 0) / traffic.length) : 0;
  const errRate = requests.length ? Math.round((requests.filter((r) => r.status >= 400).length / requests.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Network Monitor
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Live traffic, request log & latency tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs">
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-secondary animate-pulse" : "bg-muted-foreground"}`} />
            <span className={isLive ? "text-secondary" : "text-muted-foreground"}>{isLive ? "LIVE" : "PAUSED"}</span>
          </div>
          <button
            onClick={() => setIsLive((v) => !v)}
            className={`glass px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${isLive ? "text-yellow-400 hover:text-yellow-300" : "text-secondary hover:text-secondary/80"}`}
          >
            {isLive ? "Pause" : "Resume"}
          </button>
          <button onClick={() => { setTraffic([]); setRequests([]); }} className="glass px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-destructive transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Data In", value: `${totalIn} KB`, icon: ArrowDown, color: "text-primary", bg: "bg-primary/10" },
          { label: "Data Out", value: `${totalOut} KB`, icon: ArrowUp, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Avg Latency", value: `${avgLatency}ms`, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Error Rate", value: `${errRate}%`, icon: Activity, color: errRate > 10 ? "text-destructive" : "text-secondary", bg: errRate > 10 ? "bg-destructive/10" : "bg-secondary/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-2xl p-4 border border-border/20">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />Traffic (KB/s)
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={traffic}>
              <defs>
                <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(261 87% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(261 87% 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(162 72% 46%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(162 72% 46%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="in" stroke="hsl(261 87% 60%)" strokeWidth={1.5} fill="url(#inGrad)" name="In" />
              <Area type="monotone" dataKey="out" stroke="hsl(162 72% 46%)" strokeWidth={1.5} fill="url(#outGrad)" name="Out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />Latency (ms)
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={traffic}>
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="latency" stroke="hsl(35 90% 55%)" strokeWidth={2} dot={false} name="Latency" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Request log */}
      <div className="glass rounded-2xl border border-border/20 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20" style={{ background: "hsl(0 0% 5%)" }}>
          <h3 className="text-sm font-bold font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-secondary" />
            Live Request Log
          </h3>
          <span className="text-xs text-muted-foreground font-mono">{requests.length} requests captured</span>
        </div>
        <div className="max-h-72 overflow-y-auto scrollbar-thin font-mono">
          <AnimatePresence initial={false}>
            {requests.slice(0, 30).map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, backgroundColor: "hsl(261 87% 50% / 0.05)" }}
                animate={{ opacity: 1, backgroundColor: "transparent" }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] items-center gap-3 px-4 py-2 border-b border-border/10 last:border-0 hover:bg-muted/5 text-xs"
              >
                <span className={`font-bold w-12 text-center ${METHOD_COLORS[r.method] || "text-muted-foreground"}`}>{r.method}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_COLORS(r.status)}`}>{r.status}</span>
                <span className="text-muted-foreground truncate">{r.path}</span>
                <span className="text-muted-foreground/60">{r.size}</span>
                <span className={`${parseInt(r.time) > 300 ? "text-yellow-400" : "text-muted-foreground/60"}`}>{r.time}</span>
                <span className="text-muted-foreground/40">{new Date(r.ts).toLocaleTimeString()}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
