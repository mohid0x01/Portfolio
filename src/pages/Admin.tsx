import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, LogOut, Trash2, Edit3, CheckCircle2, AlertCircle,
  Layers, Github, ExternalLink, Star, LayoutDashboard, Code2, X
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { z } from "zod";
import type { Project } from "@/lib/schemas";
import { mockProjects } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { addDocument, deleteDocument } from "@/lib/firebase";

// Admin form uses raw string for techStack — transformed on submit
const adminProjectSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(80),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(500),
  techStack: z.string().trim().min(1, "Add at least one technology"),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  liveDemoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

type AdminFormData = z.infer<typeof adminProjectSchema>;

const AdminPage = () => {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitMsg, setSubmitMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminProjectSchema),
  });

  if (!user) return <Navigate to="/login" replace />;

  const onSubmit = async (data: AdminFormData) => {
    setSubmitState("idle");
    try {
      // Try Firestore first
      const techArray = Array.isArray(data.techStack)
        ? data.techStack
        : (data.techStack as unknown as string).split(",").map((s) => s.trim()).filter(Boolean);

      const newProject: Project = {
        ...data,
        id: editTarget?.id || Date.now().toString(),
        techStack: techArray,
        featured: data.featured ?? false,
        order: data.order ?? projects.length,
        createdAt: new Date().toISOString(),
      };

      try {
        await addDocument("projects", newProject);
      } catch {
        // Firebase not configured — use local state only
      }

      if (editTarget) {
        setProjects((prev) => prev.map((p) => (p.id === editTarget.id ? newProject : p)));
      } else {
        setProjects((prev) => [newProject, ...prev]);
      }

      setSubmitState("success");
      setSubmitMsg(editTarget ? "Project updated!" : "Project added successfully!");
      reset();
      setShowForm(false);
      setEditTarget(null);
      setTimeout(() => setSubmitState("idle"), 3000);
    } catch (e: unknown) {
      setSubmitState("error");
      setSubmitMsg(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDocument("projects", id);
    } catch {}
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  const openEdit = (project: Project) => {
    setEditTarget(project);
    reset({
      ...project,
      techStack: project.techStack.join(", "),
    } as AdminFormData);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 glass border-r border-border flex flex-col z-40 hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}>
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-black gradient-text">Admin Panel</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 truncate">{user.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            <ExternalLink className="w-4 h-4" />
            View Portfolio
          </a>
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-border">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="md:ml-60 p-6 lg:p-10">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <span className="font-black gradient-text text-lg">Admin Panel</span>
          <button onClick={signOut} className="glass p-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Projects", value: projects.length, icon: Layers, accent: "text-primary" },
            { label: "Featured", value: projects.filter((p) => p.featured).length, icon: Star, accent: "text-secondary" },
            { label: "With Live Demo", value: projects.filter((p) => p.liveDemoUrl).length, icon: ExternalLink, accent: "text-blue-400" },
            { label: "Open Source", value: projects.filter((p) => p.githubUrl).length, icon: Github, accent: "text-muted-foreground" },
          ].map(({ label, value, icon: Icon, accent }) => (
            <GlassCard key={label} className="p-4" hover={false}>
              <Icon className={`w-5 h-5 mb-2 ${accent}`} />
              <div className="text-2xl font-black">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Toast feedback */}
        <AnimatePresence>
          {submitState !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
                submitState === "success"
                  ? "bg-secondary/10 border-secondary/30 text-secondary"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {submitState === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              {submitMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Projects</h1>
          <button
            onClick={() => { setEditTarget(null); reset({}); setShowForm(true); }}
            className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        {/* Add/Edit form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <GlassCard className="p-6" glow="primary" hover={false}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg">
                    {editTarget ? "Edit Project" : "New Project"}
                  </h2>
                  <button onClick={() => { setShowForm(false); setEditTarget(null); reset(); }}
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input {...register("title")}
                        placeholder="Project name"
                        className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      />
                      {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tech Stack * <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
                      <input {...register("techStack" as "techStack")}
                        placeholder="React, TypeScript, Tailwind CSS"
                        className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      />
                      {errors.techStack && <p className="text-destructive text-xs mt-1">{errors.techStack.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea {...register("description")}
                      rows={3}
                      placeholder="What does this project do? What problems does it solve?"
                      className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm resize-none"
                    />
                    {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">GitHub URL</label>
                      <input {...register("githubUrl")}
                        placeholder="https://github.com/..."
                        className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      />
                      {errors.githubUrl && <p className="text-destructive text-xs mt-1">{errors.githubUrl.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Live Demo URL</label>
                      <input {...register("liveDemoUrl")}
                        placeholder="https://project.demo"
                        className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      />
                      {errors.liveDemoUrl && <p className="text-destructive text-xs mt-1">{errors.liveDemoUrl.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Image URL</label>
                      <input {...register("imageUrl")}
                        placeholder="https://img.example.com/..."
                        className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      />
                      {errors.imageUrl && <p className="text-destructive text-xs mt-1">{errors.imageUrl.message}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register("featured")}
                        className="w-4 h-4 accent-primary" />
                      <span className="text-sm">Mark as Featured</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isSubmitting}
                      className="btn-glow flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-60">
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {isSubmitting ? "Saving..." : editTarget ? "Save Changes" : "Add Project"}
                    </button>
                    <button type="button"
                      onClick={() => { setShowForm(false); setEditTarget(null); reset(); }}
                      className="glass px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects table */}
        <div className="space-y-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard className="p-4 flex items-center gap-4" hover={false} glow="none">
                {/* Color indicator */}
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: project.featured ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))" }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{project.title}</h3>
                    {project.featured && (
                      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="text-xs text-muted-foreground font-mono">{t}{" "}</span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{project.techStack.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.liveDemoUrl && (
                    <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-secondary transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(project)}
                    className="w-8 h-8 glass rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="w-8 h-8 glass rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all disabled:opacity-40"
                  >
                    {deletingId === project.id ? (
                      <span className="w-3.5 h-3.5 border border-destructive/50 border-t-destructive rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No projects yet. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
