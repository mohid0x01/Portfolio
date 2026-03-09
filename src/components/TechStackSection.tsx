import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/GlassCard";
import {
  Terminal, Globe, Shield, Cpu, Code2, Database,
  Layers, Zap, GitBranch, Server, Lock, Wifi
} from "lucide-react";

interface TechCategory {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  glowVar: string;
  tools: { name: string; level?: number; badge?: string }[];
}

const TECH_CATEGORIES: TechCategory[] = [
  {
    label: "Languages",
    icon: Code2,
    accent: "from-primary to-primary/40",
    glowVar: "hsl(261 87% 50% / 0.25)",
    tools: [
      { name: "Python",      level: 88, badge: "expert"  },
      { name: "TypeScript",  level: 78, badge: "advanced" },
      { name: "JavaScript",  level: 80, badge: "advanced" },
      { name: "Bash/Shell",  level: 85, badge: "expert"  },
      { name: "C / C++",     level: 60, badge: "intermediate" },
    ],
  },
  {
    label: "Offensive Security",
    icon: Shield,
    accent: "from-destructive to-destructive/40",
    glowVar: "hsl(0 72% 51% / 0.25)",
    tools: [
      { name: "Penetration Testing", level: 90, badge: "CEH"     },
      { name: "Web App Security",    level: 87, badge: "OWASP"   },
      { name: "Network Recon",       level: 85, badge: "expert"  },
      { name: "Exploit Dev",         level: 75, badge: "advanced" },
      { name: "Bug Bounty",          level: 88, badge: "active"  },
    ],
  },
  {
    label: "Security Tools",
    icon: Terminal,
    accent: "from-secondary to-secondary/40",
    glowVar: "hsl(162 72% 46% / 0.25)",
    tools: [
      { name: "Nmap / Masscan", level: 92, badge: "expert"   },
      { name: "Burp Suite",     level: 88, badge: "expert"   },
      { name: "Metasploit",     level: 82, badge: "advanced" },
      { name: "Wireshark",      level: 85, badge: "advanced" },
      { name: "Kali Linux",     level: 90, badge: "expert"   },
    ],
  },
  {
    label: "OSINT & Recon",
    icon: Wifi,
    accent: "from-blue-400 to-blue-400/40",
    glowVar: "hsl(217 91% 60% / 0.25)",
    tools: [
      { name: "Shodan",          level: 85, badge: "advanced" },
      { name: "theHarvester",    level: 80, badge: "advanced" },
      { name: "Maltego",         level: 75, badge: "intermediate" },
      { name: "Subfinder",       level: 88, badge: "expert"   },
      { name: "Google Dorking",  level: 90, badge: "expert"   },
    ],
  },
  {
    label: "Web Dev Stack",
    icon: Globe,
    accent: "from-primary to-secondary",
    glowVar: "hsl(261 87% 50% / 0.2)",
    tools: [
      { name: "React",        level: 78, badge: "advanced"     },
      { name: "Tailwind CSS", level: 82, badge: "advanced"     },
      { name: "Vite",         level: 75, badge: "intermediate" },
      { name: "Node.js",      level: 70, badge: "intermediate" },
      { name: "REST APIs",    level: 80, badge: "advanced"     },
    ],
  },
  {
    label: "Infrastructure",
    icon: Server,
    accent: "from-orange-400 to-orange-400/40",
    glowVar: "hsl(25 95% 53% / 0.25)",
    tools: [
      { name: "Linux (Debian/Arch)", level: 88, badge: "expert"      },
      { name: "Docker",              level: 70, badge: "intermediate" },
      { name: "Git / GitHub",        level: 85, badge: "advanced"    },
      { name: "Firebase",            level: 72, badge: "intermediate" },
      { name: "Supabase",            level: 70, badge: "intermediate" },
    ],
  },
];

const badgeStyle: Record<string, string> = {
  expert:       "bg-secondary/15 text-secondary border-secondary/30",
  advanced:     "bg-primary/15 text-primary border-primary/30",
  intermediate: "bg-muted text-muted-foreground border-border",
  CEH:          "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  OWASP:        "bg-orange-400/15 text-orange-400 border-orange-400/30",
  active:       "bg-destructive/15 text-destructive border-destructive/30",
};

export function TechStackSection() {
  return (
    <section id="techstack" className="py-24 px-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, hsl(261 87% 50% / 0.04), transparent)" }}
      />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(261 87% 50% / 0.3), transparent)" }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-mono text-sm mb-3 tracking-widest uppercase">
            // Arsenal & Tools
          </p>
          <h2 className="section-title text-5xl">Tech Stack</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From kernel exploits to React components — a full-spectrum toolkit for ethical hacking,
            offensive research, and modern web development.
          </p>
        </motion.div>

        {/* Grid of category cards */}
        <StaggerContainer className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {TECH_CATEGORIES.map((cat, ci) => {
            const CatIcon = cat.icon;
            return (
              <StaggerItem key={cat.label}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ "--cat-glow": cat.glowVar } as React.CSSProperties}
                  className="glass rounded-2xl p-6 h-full border border-border/20 transition-all duration-300
                    hover:border-border/50
                    hover:shadow-[0_0_40px_var(--cat-glow),0_12px_32px_rgba(0,0,0,0.5)]"
                >
                  {/* Card header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.accent} p-0.5`}>
                  <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center">
                        <CatIcon className="w-5 h-5 text-foreground/80" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{cat.label}</h3>
                      <p className="text-[10px] text-muted-foreground font-mono">{cat.tools.length} tools</p>
                    </div>
                  </div>

                  {/* Tools list with bars */}
                  <div className="space-y-3">
                    {cat.tools.map((tool, ti) => (
                      <div key={tool.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground/90">{tool.name}</span>
                          {tool.badge && (
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeStyle[tool.badge] ?? badgeStyle.intermediate}`}>
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        {tool.level !== undefined && (
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${cat.accent}`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${tool.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.1, delay: ti * 0.07 + ci * 0.05, ease: "easeOut" }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Bottom row — quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Lock,      label: "CVEs Researched",  value: "30+",  color: "text-destructive"  },
            { icon: Cpu,       label: "Tools Built",       value: "10+",  color: "text-primary"      },
            { icon: Database,  label: "Targets Tested",    value: "100+", color: "text-secondary"    },
            { icon: Layers,    label: "Open Source Repos", value: "20+",  color: "text-blue-400"     },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.04, y: -2 }}
              className="glass rounded-2xl p-4 text-center border border-border/20 transition-all duration-300
                hover:border-primary/25 hover:shadow-[0_0_24px_hsl(261_87%_50%_/_0.2)]"
            >
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <div className="text-2xl font-black gradient-text">{value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
