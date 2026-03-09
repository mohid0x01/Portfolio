import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/GlassCard";
import { Crosshair } from "lucide-react";
import type { Skill } from "@/lib/schemas";

interface SkillsProps {
  skills: Skill[];
}

const categoryLabels: Record<string, string> = {
  frontend: "Scripting & OSINT",
  backend: "Offensive Security",
  devops: "Security Tools",
  design: "Design",
  other: "Other",
};

const categoryAccents: Record<string, { gradient: string; glow: string; text: string }> = {
  frontend: { gradient: "from-primary to-primary/50",   glow: "hsl(261 87% 50% / 0.2)",  text: "text-primary"   },
  backend:  { gradient: "from-secondary to-secondary/50", glow: "hsl(162 72% 46% / 0.2)", text: "text-secondary" },
  devops:   { gradient: "from-blue-400 to-blue-400/50",  glow: "hsl(217 91% 60% / 0.2)",  text: "text-blue-400"  },
  design:   { gradient: "from-pink-500 to-pink-500/50",  glow: "hsl(330 80% 60% / 0.2)",  text: "text-pink-400"  },
  other:    { gradient: "from-muted-foreground to-muted-foreground/50", glow: "transparent", text: "text-muted-foreground" },
};

export function SkillsSection({ skills }: SkillsProps) {
  const categories = [...new Set(skills.map((s) => s.category))] as string[];

  return (
    <section id="skills" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 80% 50%, hsl(162 72% 46% / 0.05), transparent)" }}
      />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(162 72% 46% / 0.25), transparent)" }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-secondary/20 text-secondary text-xs font-mono tracking-widest uppercase mb-4">
            <Crosshair className="w-3 h-3" />
            Technical Arsenal
          </div>
          <h2 className="section-title text-5xl md:text-6xl mb-4">Skills</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Tools, techniques, and languages in my offensive security arsenal — from recon to exploitation.
          </p>
        </motion.div>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const catSkills = skills.filter((s) => s.category === category);
            const accent = categoryAccents[category] || categoryAccents.other;
            return (
              <StaggerItem key={category}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="glass rounded-2xl p-6 h-full border border-border/20 transition-all duration-300
                    hover:border-border/40"
                  style={{ "--cat-glow": accent.glow } as React.CSSProperties}
                >
                  {/* Card header */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`w-2 h-6 rounded-full bg-gradient-to-b ${accent.gradient}`} />
                    <h3 className={`font-bold text-sm ${accent.text}`}>{categoryLabels[category]}</h3>
                  </div>

                  <div className="space-y-5">
                    {catSkills.map((skill, i) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-foreground">{skill.name}</span>
                          <span className={`text-xs font-mono font-bold ${accent.text}`}>{skill.level}%</span>
                        </div>
                        {/* Track */}
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${accent.gradient} relative`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.3, delay: i * 0.07, ease: "easeOut" }}
                          >
                            {/* Shimmer */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                              style={{ backgroundSize: "200% 100%" }}
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
