import { motion } from "framer-motion";
import { Shield, Trophy, BookOpen, Briefcase, ExternalLink, Star, Award } from "lucide-react";

interface TimelineItem {
  date: string;
  title: string;
  org: string;
  description: string;
  tags: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  link?: string;
  highlight?: boolean;
}

const TIMELINE: TimelineItem[] = [
  {
    date: "2025 — Present",
    title: "CEH Certified Ethical Hacker",
    org: "EC-Council",
    description:
      "Achieved the Certified Ethical Hacker (v12) credential — validating expertise in network scanning, enumeration, system hacking, web application attacks, and social engineering methodologies.",
    tags: ["CEH v12", "Penetration Testing", "Network Security", "OWASP"],
    icon: Shield,
    accentColor: "hsl(162 72% 46%)",
    highlight: true,
  },
  {
    date: "2024 — Present",
    title: "Independent Bug Bounty Hunter",
    org: "HackerOne · Bugcrowd · Intigriti",
    description:
      "Actively hunting vulnerabilities in real-world targets across public and private bug bounty programs. Focus areas: XSS, IDOR, SSRF, authentication bypass, and subdomain takeovers. 50+ bugs reported.",
    tags: ["XSS", "IDOR", "SSRF", "SQLi", "Recon"],
    icon: Trophy,
    accentColor: "hsl(48 96% 53%)",
    highlight: true,
  },
  {
    date: "2024 — Present",
    title: "Security Researcher & Tool Developer",
    org: "TeamCyberOps — Open Source",
    description:
      "Building and maintaining open-source offensive security tools including NetReaper (network recon), Recon-Subdomain (passive/active enumeration), and AI-assisted analysis scripts.",
    tags: ["Python", "CLI Tools", "Open Source", "GitHub"],
    icon: Briefcase,
    accentColor: "hsl(261 87% 50%)",
    link: "https://github.com/mohidqx",
  },
  {
    date: "2026",
    title: "Indus Trails Online — Full-Stack Developer",
    org: "Personal Project",
    description:
      "Designed and shipped a full-featured travel & tourism platform for Pakistan's Indus region. TypeScript + React + Vite stack with dynamic itineraries, listings, and user journeys.",
    tags: ["TypeScript", "React", "Vite", "Tailwind CSS"],
    icon: BookOpen,
    accentColor: "hsl(217 91% 60%)",
    link: "https://github.com/mohidqx/indus-trails-online-7d2b34c3",
  },
];

const CERTS = [
  { name: "Certified Ethical Hacker (CEH v12)", issuer: "EC-Council",        year: "2025", color: "text-secondary",   bg: "bg-secondary/10",  border: "border-secondary/25"  },
  { name: "Google Cybersecurity Certificate",   issuer: "Coursera / Google",  year: "2024", color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/25"   },
  { name: "Introduction to Dark Web & OSINT",   issuer: "EC-Council CodeRed", year: "2024", color: "text-primary",    bg: "bg-primary/10",    border: "border-primary/25"    },
  { name: "Ethical Hacking Essentials (EHE)",   issuer: "EC-Council",         year: "2024", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/25" },
];

export function ExperienceSection() {
  return (
    <section id="experience" className="py-28 px-6 relative overflow-hidden">
      {/* Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(162 72% 46% / 0.3), transparent)" }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 30% 50%, hsl(162 72% 46% / 0.04), transparent)" }}
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
            <Award className="w-3 h-3" />
            Track Record
          </div>
          <h2 className="section-title text-5xl md:text-6xl mb-4">Experience</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Certifications, bug bounty achievements, and projects that define the journey.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Timeline */}
          <div className="lg:col-span-3 space-y-0">
            {TIMELINE.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="relative pl-12 pb-10 last:pb-0"
                >
                  {/* Connector line */}
                  {i < TIMELINE.length - 1 && (
                    <div
                      className="absolute left-[17px] top-9 bottom-0 w-px"
                      style={{ background: `linear-gradient(to bottom, ${item.accentColor.replace(")", " / 0.4)")}, transparent)` }}
                    />
                  )}

                  {/* Icon node */}
                  <motion.div
                    whileHover={{ scale: 1.25 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="absolute left-0 top-1 w-8 h-8 rounded-full border border-border/50 flex items-center justify-center bg-card"
                    style={{ boxShadow: `0 0 16px ${item.accentColor.replace(")", " / 0.35)")}` }}
                  >
                    <Icon className="w-4 h-4 text-foreground/80" />
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 320, damping: 25 }}
                    className={`glass rounded-2xl p-6 border transition-all duration-300 cursor-default
                      ${item.highlight ? "border-border/30 hover:border-border/60" : "border-border/15 hover:border-border/40"}
                      hover:shadow-[0_0_40px_rgba(0,0,0,0.4)]`}
                    style={{ "--item-glow": item.accentColor.replace(")", " / 0.15)") } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {item.highlight && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                          <h3 className="font-bold text-sm leading-tight">{item.title}</h3>
                        </div>
                        <p className="text-xs font-mono" style={{ color: item.accentColor }}>{item.org}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {item.date}
                        </span>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border"
                          style={{
                            background: item.accentColor.replace(")", " / 0.08)"),
                            borderColor: item.accentColor.replace(")", " / 0.3)"),
                            color: item.accentColor,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Certs sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-5">
                <Shield className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">
                  Certifications
                </span>
              </div>
              <div className="space-y-3">
                {CERTS.map((cert, i) => (
                  <motion.div
                    key={cert.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.02, x: -3 }}
                    className={`glass rounded-xl p-4 border ${cert.border} transition-all duration-300
                      hover:shadow-[0_0_20px_rgba(0,0,0,0.35)]`}
                  >
                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full ${cert.bg} ${cert.color} mb-2`}>
                      <Shield className="w-2.5 h-2.5" />
                      {cert.year}
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-snug">{cert.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{cert.issuer}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTF Stats card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="mt-4 glass rounded-xl p-5 border border-primary/20 transition-all duration-300
                  hover:border-primary/40 hover:shadow-[0_0_30px_hsl(261_87%_50%_/_0.2)]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <span className="text-xs font-bold">CTF & Bug Bounty</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Bugs Reported", value: "50+", color: "text-secondary" },
                    { label: "Active Platforms", value: "3", color: "text-primary" },
                    { label: "CTFs Competed", value: "10+", color: "text-yellow-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-[11px] text-muted-foreground">{label}</span>
                      <span className={`text-sm font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
