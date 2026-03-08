import { GlassCard, StaggerContainer, StaggerItem } from "@/components/ui/GlassCard";
import { ExternalLink, Github, Star } from "lucide-react";
import type { Project } from "@/lib/schemas";

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
    <span
      className={`text-xs px-2.5 py-1 rounded-full border font-mono font-medium ${colorClass}`}
    >
      {tech}
    </span>
  );
}

export function ProjectsSection({ projects }: ProjectsProps) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-secondary font-mono text-sm mb-3 tracking-widest uppercase">
            // Selected Work
          </p>
          <h2 className="section-title text-5xl">Projects</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Security tools, web apps, and open-source projects — built for hackers, researchers, and curious minds.
          </p>
        </div>

        {/* Featured projects — larger cards */}
        {featured.length > 0 && (
          <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-6">
            {featured.map((project, i) => (
              <StaggerItem key={project.id}>
                <GlassCard
                  className="group h-full p-6 flex flex-col"
                  glow="primary"
                  delay={i * 0.08}
                >
                  {/* Featured badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-1.5 text-xs text-secondary font-mono">
                      <Star className="w-3 h-3 fill-secondary" />
                      Featured
                    </span>
                    <div className="flex gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 glass rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveDemoUrl && (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 glass rounded-lg flex items-center justify-center text-muted-foreground hover:text-secondary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Project image placeholder */}
                  <div className="w-full h-40 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative"
                    style={{ background: "linear-gradient(135deg, hsl(261 87% 50% / 0.1), hsl(162 72% 46% / 0.05))" }}
                  >
                    <span className="text-5xl font-black opacity-10 select-none">
                      {project.title[0]}
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "linear-gradient(135deg, hsl(261 87% 50% / 0.15), hsl(162 72% 46% / 0.1))" }}
                    />
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <TechBadge key={tech} tech={tech} />
                    ))}
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Rest of projects — compact */}
        {rest.length > 0 && (
          <StaggerContainer className="grid md:grid-cols-3 gap-4">
            {rest.map((project, i) => (
              <StaggerItem key={project.id}>
                <GlassCard className="group h-full p-5 flex flex-col" glow="secondary">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold group-hover:text-secondary transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <div className="flex gap-1.5 shrink-0">
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
                    {project.techStack.slice(0, 3).map((tech) => (
                      <TechBadge key={tech} tech={tech} />
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
