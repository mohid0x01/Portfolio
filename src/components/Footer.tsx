import { motion } from "framer-motion";
import { Github, Heart, Bug, Shield, Mail, ArrowUpRight } from "lucide-react";
import { mockProfile } from "@/lib/mockData";

const FOOTER_LINKS = [
  { label: "Projects",   href: "#projects"   },
  { label: "Stack",      href: "#techstack"  },
  { label: "Experience", href: "#experience" },
  { label: "Skills",     href: "#skills"     },
  { label: "Contact",    href: "#contact"    },
];

export function Footer() {
  return (
    <footer className="relative pt-16 pb-8 px-6 overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(261 87% 50% / 0.3), hsl(162 72% 46% / 0.2), transparent)" }}
      />
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, hsl(261 87% 50% / 0.04), transparent)" }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Main footer grid */}
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="gradient-text font-black text-lg">mohid.sec</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              CEH Certified Ethical Hacker, Bug Bounty Hunter, and Security Researcher based in Pakistan.
            </p>
            <div className="flex gap-2.5">
              <motion.a
                href={mockProfile.githubUrl} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-9 h-9 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-glow-sm transition-all"
              >
                <Github className="w-4 h-4" />
              </motion.a>
              <motion.a
                href={`mailto:${mockProfile.email}`}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-9 h-9 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-secondary hover:border-secondary/30 transition-all"
              >
                <Mail className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest mb-4">Navigation</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest mb-4">Programs</p>
            <div className="space-y-3">
              <motion.a
                href="/bug-bounty"
                whileHover={{ x: 4 }}
                className="flex items-center justify-between glass p-3.5 rounded-xl border border-secondary/20
                  hover:border-secondary/40 hover:shadow-[0_0_20px_hsl(162_72%_46%_/_0.15)] transition-all duration-300 group"
              >
                <div className="flex items-center gap-2.5">
                  <Bug className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-foreground">Bug Bounty</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-secondary transition-colors" />
              </motion.a>
              <motion.a
                href="/admin"
                whileHover={{ x: 4 }}
                className="flex items-center justify-between glass p-3.5 rounded-xl border border-primary/20
                  hover:border-primary/40 hover:shadow-[0_0_20px_hsl(261_87%_50%_/_0.15)] transition-all duration-300 group"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Admin Panel</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/60">
          <span className="font-mono">© {new Date().getFullYear()} {mockProfile.name}. All rights reserved.</span>
          <div className="flex items-center gap-1 font-mono">
            Built with
            <Heart className="w-3 h-3 text-destructive mx-1 fill-destructive" />
            and too much coffee.
          </div>
        </div>
      </div>
    </footer>
  );
}
