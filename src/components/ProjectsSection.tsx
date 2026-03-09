import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard, StaggerContainer, StaggerItem } from "@/components/ui/GlassCard";
import { ExternalLink, Github, Star, ArrowUpRight, Folder } from "lucide-react";
import type { Project } from "@/lib/schemas";
import { ProjectModal } from "@/components/ProjectModal";

interface ProjectsProps {
  projects: Project[];
}

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
  default: "bg-muted text-muted-foreground border-border",
};

function TechBadge({ tech }: { tech: string }) {
  const colorClass = techColors[tech] || techColors.default;
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-mono font-medium ${colorClass}`}>
      {tech}
    </span>
  );
}

export function ProjectsSection({ projects }: ProjectsProps) {
  const [selected, setSelected] = useState<Project | null>(null);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <>
      <section id="projects" className="py-28 px-6 relative overflow-hidden">
        {/* Background radials */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(261 87% 50% / 0.06), transparent)" }}
        />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, hsl(261 87% 50% / 0.25), transparent)" }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-xs font-mono tracking-widest uppercase mb-4">
              <Folder className="w-3 h-3" />
              Selected Work
            </div>
            <h2 className="section-title text-5xl md:text-6xl mb-4">Projects</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
              Security tools, web apps, and open-source projects — built for hackers, researchers, and curious minds.
            </p>
          </motion.div>

          {/* Featured projects */}
          {featured.length > 0 && (
            <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-6">
              {featured.map((project, i) => (
                <StaggerItem key={project.id}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    onClick={() => setSelected(project)}
                    className="group cursor-pointer h-full glass rounded-2xl p-7 flex flex-col
                      border border-border/20 hover:border-primary/30
                      hover:shadow-[0_0_50px_hsl(261_87%_50%_/_0.15),0_20px_40px_rgba(0,0,0,0.4)]
                      transition-all duration-400"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-1.5 text-xs text-secondary font-mono bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                        <Star className="w-3 h-3 fill-secondary" />
                        Featured
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                            className="w-8 h-8 glass rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.liveDemoUrl && (
                          <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer"
                            className="w-8 h-8 glass rounded-lg flex items-center justify-center text-muted-foreground hover:text-secondary hover:border-secondary/30 transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Image preview */}
                    <div className="w-full h-44 rounded-xl mb-5 flex items-center justify-center overflow-hidden relative"
                      style={{ background: "linear-gradient(135deg, hsl(261 87% 50% / 0.08), hsl(162 72% 46% / 0.04))" }}
                    >
                      <span className="text-7xl font-black select-none"
                        style={{ color: "hsl(261 87% 50% / 0.08)" }}>
                        {project.title[0]}
                      </span>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, hsl(261 87% 50% / 0.12), hsl(162 72% 46% / 0.08))" }}>
                        <div className="flex items-center gap-2 text-foreground/80 text-sm font-medium bg-background/40 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
                          <ArrowUpRight className="w-4 h-4" />
                          View Details
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2.5 group-hover:text-primary transition-colors duration-200">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => <TechBadge key={tech} tech={tech} />)}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Rest of projects */}
          {rest.length > 0 && (
            <StaggerContainer className="grid md:grid-cols-3 gap-4">
              {rest.map((project) => (
                <StaggerItem key={project.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    onClick={() => setSelected(project)}
                    className="group cursor-pointer h-full glass rounded-2xl p-5 flex flex-col
                      border border-border/15 hover:border-secondary/25
                      hover:shadow-[0_0_30px_hsl(162_72%_46%_/_0.12),0_12px_28px_rgba(0,0,0,0.3)]
                      transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold group-hover:text-secondary transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
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
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 3).map((tech) => <TechBadge key={tech} tech={tech} />)}
                      {project.techStack.length > 3 && (
                        <span className="text-xs text-muted-foreground px-2 py-1 font-mono">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
