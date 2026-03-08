import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Eye, LogOut, Code2, ExternalLink,
  BarChart3, Terminal, Shield, StickyNote, Wifi,
  Server, FolderLock, Settings, Layers, Github,
  Star, Plus, CheckCircle2, AlertCircle, X, Edit3, Trash2,
  Activity, Zap, Globe, ChevronRight, Menu, Ghost,
  TrendingUp, Users, Database, Sun, Moon, MapPin
} from "lucide-react";
import { z } from "zod";
import { Navigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { VisitorLogs } from "@/components/admin/VisitorLogs";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminTerminal } from "@/components/admin/AdminTerminal";
import { AdminSecurity } from "@/components/admin/AdminSecurity";
import { AdminNotes } from "@/components/admin/AdminNotes";
import { AdminNetworkMonitor } from "@/components/admin/AdminNetworkMonitor";
import { AdminSystemHealth } from "@/components/admin/AdminSystemHealth";
import { AdminFileVault } from "@/components/admin/AdminFileVault";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminBugBounty } from "@/components/admin/AdminBugBounty";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { countryCodeToFlag } from "@/lib/flagEmoji";
import { supabase } from "@/integrations/supabase/client";
import { mockProjects } from "@/lib/mockData";
import type { Project } from "@/lib/schemas";
import { addDocument, deleteDocument } from "@/lib/firebase";

// ── Form Schema ───────────────────────────────────────────────────────────────
const adminProjectSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(500),
  techStack: z.string().trim().min(1),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveDemoUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});
type AdminFormData = z.infer<typeof adminProjectSchema>;

// ── Tab config ────────────────────────────────────────────────────────────────
type TabId =
  | "overview"
  | "analytics"
  | "visitors"
  | "projects"
  | "security"
  | "terminal"
  | "network"
  | "health"
  | "vault"
  | "notes"
  | "bugbounty"
  | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  group: "main" | "tools" | "system";
}

const TABS: Tab[] = [
  // Main
  { id: "overview",   label: "Overview",    icon: LayoutDashboard, group: "main" },
  { id: "analytics",  label: "Analytics",   icon: BarChart3,       group: "main" },
  { id: "visitors",   label: "Intel",        icon: Eye,             group: "main", badge: "LIVE", badgeColor: "secondary" },
  { id: "projects",   label: "Projects",     icon: Layers,          group: "main" },
  // Tools
  { id: "security",   label: "Security",     icon: Shield,          group: "tools", badge: "8", badgeColor: "destructive" },
  { id: "terminal",   label: "Terminal",     icon: Terminal,        group: "tools" },
  { id: "network",    label: "Network",      icon: Wifi,            group: "tools" },
  { id: "vault",      label: "File Vault",   icon: FolderLock,      group: "tools" },
  { id: "bugbounty",  label: "Bug Bounty",   icon: Ghost,           group: "tools", badge: "NEW", badgeColor: "primary" },
  // System
  { id: "health",     label: "Health",       icon: Server,          group: "system", badge: "●", badgeColor: "secondary" },
  { id: "notes",      label: "Notes",        icon: StickyNote,      group: "system" },
  { id: "settings",   label: "Settings",     icon: Settings,        group: "system" },
];

// ── Realtime Activity Feed ────────────────────────────────────────────────────
interface ActivityItem {
  id: string;
  msg: string;
  type: "visitor" | "bot" | "chat" | "system";
  time: Date;
}

function useRealtimeActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const seenRef = useRef(new Set<string>());

  const push = (item: ActivityItem) => {
    setItems((prev) => {
      if (seenRef.current.has(item.id)) return prev;
      seenRef.current.add(item.id);
      return [item, ...prev.slice(0, 29)];
    });
  };

  useEffect(() => {
    // ── visitor_logs ──────────────────────────────────────────
    const visitorChannel = supabase
      .channel("overview-visitors")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitor_logs" }, (payload) => {
        const row = payload.new as {
          id: string;
          country?: string | null;
          country_code?: string | null;
          city?: string | null;
          is_bot?: boolean | null;
          ip_address?: string | null;
          visited_at?: string;
        };
        const flag = row.country_code ? countryCodeToFlag(row.country_code) : "🌐";
        const location = [row.city, row.country].filter(Boolean).join(", ") || "Unknown";
        push({
          id: `v-${row.id}`,
          msg: row.is_bot
            ? `🤖 Bot detected — ${row.ip_address || "Unknown IP"}`
            : `${flag} New visitor from ${location}`,
          type: row.is_bot ? "bot" : "visitor",
          time: new Date(row.visited_at || Date.now()),
        });
      })
      .subscribe();

    // ── ghost_messages ────────────────────────────────────────
    const chatChannel = supabase
      .channel("overview-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ghost_messages" }, (payload) => {
        const row = payload.new as {
          id: string;
          room_id: string;
          content?: string | null;
          message_type?: string;
          created_at?: string;
        };
        const preview = row.content
          ? row.content.length > 40 ? row.content.slice(0, 40) + "…" : row.content
          : `[${row.message_type ?? "file"}]`;
        push({
          id: `c-${row.id}`,
          msg: `💬 Ghost Chat — ${preview}`,
          type: "chat",
          time: new Date(row.created_at || Date.now()),
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(visitorChannel);
      supabase.removeChannel(chatChannel);
    };
  }, []);

  return items;
}

// ── Overview quick-stats ──────────────────────────────────────────────────────
function Overview({ projects, onTabChange }: { projects: Project[]; onTabChange: (t: TabId) => void }) {
  const realtimeActivity = useRealtimeActivity();

  function timeAgo(date: Date) {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  }

  const quickStats = [
    { label: "Total Projects", value: projects.length, icon: Layers, color: "text-primary", bg: "bg-primary/10", tab: "projects" as TabId },
    { label: "Featured Works", value: projects.filter((p) => p.featured).length, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10", tab: "projects" as TabId },
    { label: "Visitor Intel", value: "Live", icon: Eye, color: "text-secondary", bg: "bg-secondary/10", tab: "visitors" as TabId },
    { label: "Threats Today", value: 8, icon: Shield, color: "text-destructive", bg: "bg-destructive/10", tab: "security" as TabId },
    { label: "System Health", value: "98%", icon: Server, color: "text-secondary", bg: "bg-secondary/10", tab: "health" as TabId },
    { label: "Network", value: "Online", icon: Wifi, color: "text-blue-400", bg: "bg-blue-400/10", tab: "network" as TabId },
    { label: "Open Source", value: projects.filter((p) => p.githubUrl).length, icon: Github, color: "text-muted-foreground", bg: "bg-muted/20", tab: "projects" as TabId },
    { label: "Analytics", value: "7d", icon: BarChart3, color: "text-primary", bg: "bg-primary/10", tab: "analytics" as TabId },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black gradient-text">Command Center</h2>
        <p className="text-sm text-muted-foreground mt-1">Your ghost operations at a glance</p>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map(({ label, value, icon: Icon, color, bg, tab }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onTabChange(tab)}
            className="glass rounded-2xl p-4 text-left border border-border/20 hover:border-primary/30 transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-2xl font-black mb-0.5">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </motion.button>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Realtime activity feed */}
        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Live Activity Feed
            <span className="ml-auto flex items-center gap-1 text-[10px] font-mono text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              LIVE
            </span>
          </h3>
          <div className="space-y-0.5 max-h-64 overflow-y-auto scrollbar-thin pr-1">
            {realtimeActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MapPin className="w-6 h-6 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">Watching for activity...</p>
                <p className="text-[10px] text-muted-foreground/40 mt-0.5">New visitors will appear here in realtime</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {realtimeActivity.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -16, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2.5 py-1.5"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      a.type === "bot" ? "bg-destructive" : "bg-primary"
                    }`} />
                    <span className="text-xs text-foreground/80 flex-1">{a.msg}</span>
                    <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 font-mono whitespace-nowrap">{timeAgo(a.time)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Module launcher */}
        <div className="glass rounded-2xl p-5 border border-border/20">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            Quick Launch
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {TABS.filter((t) => t.id !== "overview").map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="glass rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-primary/10 hover:border-primary/20 border border-border/20 transition-all group"
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* System status strip */}
      <div className="glass rounded-2xl p-4 border border-secondary/20" style={{ background: "hsl(162 72% 46% / 0.03)" }}>
        <div className="flex items-center gap-6 text-xs font-mono flex-wrap gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary font-bold">ALL SYSTEMS OPERATIONAL</span>
          </div>
          {["Web Server", "Database", "Auth", "CDN", "Ghost Chat"].map((s) => (
            <div key={s} className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-secondary" />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitMsg, setSubmitMsg] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AdminFormData>({
    resolver: zodResolver(adminProjectSchema),
  });

  const onSubmit = async (data: AdminFormData) => {
    try {
      const techArray = (data.techStack as unknown as string).split(",").map((s) => s.trim()).filter(Boolean);
      const newProject: Project = {
        ...data, id: editTarget?.id || Date.now().toString(), techStack: techArray,
        featured: data.featured ?? false, order: data.order ?? projects.length,
        createdAt: new Date().toISOString(),
      };
      try { await addDocument("projects", newProject); } catch {}
      if (editTarget) setProjects((prev) => prev.map((p) => p.id === editTarget.id ? newProject : p));
      else setProjects((prev) => [newProject, ...prev]);
      setSubmitState("success");
      setSubmitMsg(editTarget ? "Project updated!" : "Project added!");
      reset(); setShowForm(false); setEditTarget(null);
      setTimeout(() => setSubmitState("idle"), 3000);
    } catch (e: unknown) {
      setSubmitState("error");
      setSubmitMsg(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDocument("projects", id); } catch {}
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const openEdit = (project: Project) => {
    setEditTarget(project);
    reset({ ...project, techStack: project.techStack.join(", ") } as AdminFormData);
    setShowForm(true);
  };

  const INPUT = "w-full px-4 py-3 rounded-xl glass text-sm border border-border/20 focus:border-primary/40 focus:outline-none transition-colors placeholder:text-muted-foreground";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text">Projects</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); reset({}); setShowForm(true); }}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        >
          <Plus className="w-4 h-4" />Add Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: projects.length, color: "text-primary" },
          { label: "Featured", value: projects.filter((p) => p.featured).length, color: "text-yellow-400" },
          { label: "Live Demo", value: projects.filter((p) => p.liveDemoUrl).length, color: "text-secondary" },
          { label: "Open Source", value: projects.filter((p) => p.githubUrl).length, color: "text-blue-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-3 border border-border/20 text-center">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {submitState !== "idle" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-3 p-4 rounded-xl border ${
              submitState === "success" ? "bg-secondary/10 border-secondary/30 text-secondary" : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}>
            {submitState === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {submitMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <GlassCard className="p-6" glow="primary" hover={false}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold">{editTarget ? "Edit Project" : "New Project"}</h3>
                <button onClick={() => { setShowForm(false); setEditTarget(null); reset(); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Title *</label>
                    <input {...register("title")} placeholder="Project name" className={INPUT} />
                    {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Tech Stack * (comma-separated)</label>
                    <input {...register("techStack" as "techStack")} placeholder="React, TypeScript, Tailwind" className={INPUT} />
                    {errors.techStack && <p className="text-destructive text-xs mt-1">{errors.techStack.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Description *</label>
                  <textarea {...register("description")} rows={3} placeholder="Describe this project..." className={`${INPUT} resize-none`} />
                  {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { field: "githubUrl" as const, label: "GitHub URL", placeholder: "https://github.com/..." },
                    { field: "liveDemoUrl" as const, label: "Live Demo URL", placeholder: "https://demo.com" },
                    { field: "imageUrl" as const, label: "Image URL", placeholder: "https://img.com/..." },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field}>
                      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
                      <input {...register(field)} placeholder={placeholder} className={INPUT} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" {...register("featured")} className="w-4 h-4 accent-primary rounded" />
                    Mark as Featured
                  </label>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={isSubmitting} className="btn-glow flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white disabled:opacity-60">
                    {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSubmitting ? "Saving..." : editTarget ? "Save Changes" : "Add Project"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); reset(); }} className="glass px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects list */}
      <div className="space-y-2">
        {projects.map((project, i) => (
          <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GlassCard className="p-4" hover={false} glow="none">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: project.featured ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{project.title}</h3>
                    {project.featured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">Featured</span>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="text-xs text-muted-foreground font-mono">{t}</span>
                    ))}
                    {project.techStack.length > 4 && <span className="text-xs text-muted-foreground">+{project.techStack.length - 4}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"><Github className="w-3.5 h-3.5" /></a>}
                  {project.liveDemoUrl && <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-muted-foreground hover:text-secondary transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}
                  <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
const AdminPage = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visitorCountryFilter, setVisitorCountryFilter] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  const handleCountryFilter = (code: string | null) => {
    setVisitorCountryFilter(code);
    setActiveTab("visitors");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":   return <Overview projects={mockProjects} onTabChange={setActiveTab} />;
      case "analytics":  return <AdminAnalytics onCountryFilter={handleCountryFilter} />;
      case "visitors":   return <VisitorLogs countryFilter={visitorCountryFilter} />;
      case "projects":   return <ProjectsTab />;
      case "security":   return <AdminSecurity />;
      case "terminal":   return <AdminTerminal />;
      case "network":    return <AdminNetworkMonitor />;
      case "vault":      return <AdminFileVault />;
      case "health":     return <AdminSystemHealth />;
      case "notes":      return <AdminNotes />;
      case "bugbounty":  return <AdminBugBounty />;
      case "settings":   return <AdminSettings />;
      default:           return null;
    }
  };

  const GROUP_LABELS: Record<Tab["group"], string> = { main: "Main", tools: "Security Tools", system: "System" };
  const groupedTabs = TABS.reduce((acc, tab) => {
    if (!acc[tab.group]) acc[tab.group] = [];
    acc[tab.group].push(tab);
    return acc;
  }, {} as Record<Tab["group"], Tab[]>);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <Ghost className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black gradient-text text-sm">Ghost Panel</span>
            <p className="text-[10px] text-muted-foreground truncate max-w-32">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
        {(["main", "tools", "system"] as const).map((group) => (
          <div key={group}>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-1">
              {GROUP_LABELS[group]}
            </p>
            <div className="space-y-0.5">
              {groupedTabs[group]?.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "group-hover:text-foreground"}`} />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        tab.badgeColor === "destructive" ? "bg-destructive/20 text-destructive" :
                        tab.badgeColor === "secondary" ? "bg-secondary/20 text-secondary" :
                        "bg-primary/20 text-primary"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border/20 space-y-1 flex-shrink-0">
        <a href="/"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          View Portfolio
        </a>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 fixed top-0 left-0 bottom-0 z-40 border-r border-border/20 flex-shrink-0"
        style={{ background: "hsl(0 0% 4%)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col border-r border-border/20 md:hidden"
              style={{ background: "hsl(0 0% 4%)" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 px-4 md:px-6 py-3 border-b border-border/20 flex items-center gap-3 flex-shrink-0"
          style={{ background: "hsl(0 0% 4% / 0.95)", backdropFilter: "blur(12px)" }}
        >
          {/* Mobile menu */}
          <button onClick={() => setSidebarOpen(true)} className="md:hidden glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
            <Ghost className="w-4 h-4 text-primary flex-shrink-0" />
            <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="font-bold truncate">{currentTab.label}</span>
            {currentTab.badge && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${
                currentTab.badgeColor === "destructive" ? "bg-destructive/20 text-destructive" :
                currentTab.badgeColor === "secondary" ? "bg-secondary/20 text-secondary animate-pulse" :
                "bg-primary/20 text-primary"
              }`}>
                {currentTab.badge}
              </span>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status pill */}
            <div className="hidden sm:flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary font-mono font-bold">ONLINE</span>
            </div>
            {/* Tab quick-switcher pills */}
            <div className="hidden lg:flex items-center gap-1">
              {TABS.slice(0, 4).map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`p-2 rounded-lg transition-colors ${activeTab === t.id ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                    title={t.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Realtime notifications */}
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer status bar */}
        <footer
          className="px-6 py-2 border-t border-border/15 flex items-center gap-4 text-[10px] font-mono text-muted-foreground flex-shrink-0"
          style={{ background: "hsl(0 0% 3%)" }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary">GHOST PANEL v3.0</span>
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span>{user.email}</span>
          <span className="text-muted-foreground/40">•</span>
          <span>{new Date().toLocaleString()}</span>
          <span className="ml-auto">{activeTab.toUpperCase()}</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminPage;
