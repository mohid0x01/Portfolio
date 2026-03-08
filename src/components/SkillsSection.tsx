import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/GlassCard";
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

const categoryAccents: Record<string, string> = {
  frontend: "from-primary to-primary/50",
  backend: "from-secondary to-secondary/50",
  devops: "from-blue-500 to-blue-500/50",
  design: "from-pink-500 to-pink-500/50",
  other: "from-muted-foreground to-muted-foreground/50",
};

export function SkillsSection({ skills }: SkillsProps) {
  const categories = [
    ...new Set(skills.map((s) => s.category)),
  ] as string[];

  return (
    <section id="skills" className="py-24 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 80% 50%, hsl(162 72% 46% / 0.05), transparent)" }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-secondary font-mono text-sm mb-3 tracking-widest uppercase">
            // Technical Arsenal
          </p>
          <h2 className="section-title text-5xl">Skills</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tools, techniques, and languages in my offensive security arsenal — from recon to exploitation.
          </p>
        </div>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const catSkills = skills.filter((s) => s.category === category);
            const accent = categoryAccents[category] || categoryAccents.other;
            return (
              <StaggerItem key={category}>
                <div className="glass p-6 h-full">
                  <h3 className="font-bold mb-5 flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${accent}`}
                    />
                    {categoryLabels[category]}
                  </h3>
                  <div className="space-y-4">
                    {catSkills.map((skill, i) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium text-foreground">
                            {skill.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "hsl(var(--muted))" }}>
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${accent}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 1.2,
                              delay: i * 0.08,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
