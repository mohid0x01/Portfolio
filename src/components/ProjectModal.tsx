import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink, Github, X, Code2, Star, Calendar,
  GitFork, AlertCircle, Clock, Eye,
} from "lucide-react";
import type { Project } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useGitHubStats } from "@/hooks/useGitHubStats";

const techColors: Record<string, string> = {
  React: "bg-primary/10 text-primary border-primary/20",
  "React Native": "bg-primary/10 text-primary border-primary/20",
  TypeScript: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  JavaScript: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Python: "bg-green-500/10 text-green-400 border-green-500/20",
  "Node.js": "bg-green-600/10 text-green-500 border-green-600/20",
  Go: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Rust: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Firebase: "bg-yellow-600/10 text-yellow-500 border-yellow-600/20",
  "Next.js": "bg-foreground/10 text-foreground border-foreground/20",
  "Tailwind CSS": "bg-secondary/10 text-secondary border-secondary/20",
  Docker: "bg-blue-600/10 text-blue-400 border-blue-600/20",
  Bash: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  CLI: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Nmap: "bg-red-500/10 text-red-400 border-red-500/20",
  Socket: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DNS: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  OSINT: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  HTML: "bg-orange-600/10 text-orange-500 border-orange-600/20",
  CSS: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  Markdown: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  default: "bg-muted text-muted-foreground border-border",
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function StatSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
      ))}
    </div>
  );
}

interface GitHubStatsBarProps {
  githubUrl: string;
}

function GitHubStatsBar({ githubUrl }: GitHubStatsBarProps) {
  const { data, isLoading, isError } = useGitHubStats(githubUrl);

  if (isLoading) return <StatSkeleton />;
  if (isError || !data) return null;

  const stats = [
    { icon: <Star className="w-3.5 h-3.5 text-yellow-400" />, label: "Stars", value: data.stars.toLocaleString() },
    { icon: <GitFork className="w-3.5 h-3.5 text-secondary" />, label: "Forks", value: data.forks.toLocaleString() },
    { icon: <Eye className="w-3.5 h-3.5 text-primary" />, label: "Watchers", value: data.watchers.toLocaleString() },
    { icon: <AlertCircle className="w-3.5 h-3.5 text-orange-400" />, label: "Issues", value: data.openIssues.toLocaleString() },
  ];

  return (
    <div className="space-y-3">
      {/* Stat chips */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border/40 bg-background/40"
          >
            {s.icon}
            <span className="text-base font-black font-mono">{s.value}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Meta row: last push + language */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
        {data.pushedAt && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last push {formatRelativeTime(data.pushedAt)}
          </span>
        )}
        {data.language && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            {data.language}
          </span>
        )}
        {data.topics.slice(0, 4).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full border border-border/50 bg-muted/30">
            #{t}
          </span>
        ))}
      </div>
    </div>
  );
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (project) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [project]);

  const repoName = project?.githubUrl?.split("/").slice(-1)[0] ?? "";

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[91] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg border border-border/50 bg-background/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Hero banner */}
              <div
                className="w-full h-44 rounded-t-2xl flex items-center justify-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--secondary) / 0.08))" }}
              >
                <span
                  className="text-[7rem] font-black select-none leading-none"
                  style={{ color: "hsl(var(--primary) / 0.08)" }}
                >
                  {project.title[0]}
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-32 h-32 rounded-full blur-3xl opacity-30"
                    style={{ background: "hsl(var(--primary))" }}
                  />
                </div>
                {project.featured && (
                  <span className="absolute top-4 left-4 flex items-center gap-1 text-xs font-mono text-secondary border border-secondary/30 bg-secondary/10 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-secondary" /> Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Title + links */}
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h2 className="text-2xl font-black leading-tight">{project.title}</h2>
                    {project.createdAt && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {project.githubUrl && (
                      <Button asChild size="sm" variant="outline" className="gap-1.5 font-mono text-xs">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-3.5 h-3.5" /> GitHub
                        </a>
                      </Button>
                    )}
                    {project.liveDemoUrl && (
                      <Button asChild size="sm" className="gap-1.5 font-mono text-xs">
                        <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* GitHub Live Stats */}
                {project.githubUrl && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Github className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                        GitHub Stats
                      </h3>
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground/50 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse inline-block" />
                        live
                      </span>
                    </div>
                    <GitHubStatsBar githubUrl={project.githubUrl} />
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                </div>

                {/* Tech Stack */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                      Tech Stack
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => {
                      const cls = techColors[tech] ?? techColors.default;
                      return (
                        <span key={tech} className={`text-xs px-2.5 py-1 rounded-full border font-mono font-medium ${cls}`}>
                          {tech}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Repo link banner */}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/40 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                  >
                    <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-semibold truncate">mohidqx / {repoName}</p>
                      <p className="text-xs text-muted-foreground truncate">{project.githubUrl}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
