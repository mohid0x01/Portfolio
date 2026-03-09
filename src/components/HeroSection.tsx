import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Download, ArrowDown, Shield } from "lucide-react";
import { mockProfile, mockStats } from "@/lib/mockData";
import mohidAvatar from "@/assets/mohid-avatar.png";
import { useState, useEffect } from "react";

const ROLES = [
  "Certified Ethical Hacker",
  "Bug Bounty Hunter",
  "Security Researcher",
  "OSINT Specialist",
  "Penetration Tester",
];

function TypewriterText() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = ROLES[roleIndex];

    if (phase === "typing") {
      if (charIndex < current.length) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 55);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("pause"), 1800);
        return () => clearTimeout(t);
      }
    }

    if (phase === "pause") {
      const t = setTimeout(() => setPhase("erasing"), 400);
      return () => clearTimeout(t);
    }

    if (phase === "erasing") {
      if (charIndex > 0) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, 28);
        return () => clearTimeout(t);
      } else {
        setRoleIndex((r) => (r + 1) % ROLES.length);
        setPhase("typing");
      }
    }
  }, [phase, charIndex, roleIndex]);

  return (
    <span className="gradient-text inline-flex items-center gap-0.5">
      <span>{displayed}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-0.5 h-[1em] bg-primary ml-0.5 rounded-full align-middle"
      />
    </span>
  );
}

export function HeroSection() {
  const statIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Layers: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l6-3 6 3M6 12l6-3 6 3M6 18l6-3 6 3" />
      </svg>
    ),
    Star: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    Calendar: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    GitMerge: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-hero-glow" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(261 87% 50% / 0.2), transparent)" }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(162 72% 46% / 0.2), transparent)" }}
      />

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center text-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm"
        >
          <Shield className="w-4 h-4 text-secondary" />
          <span className="text-muted-foreground">CEH Certified •</span>
          <span className="text-secondary font-medium">{mockProfile.location}</span>
        </motion.div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden relative animate-pulse-glow border-2 border-primary/30">
            <img
              src={mohidAvatar}
              alt="Muhammad Mohid"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(135deg, hsl(261 87% 50% / 0.1), transparent)" }}
            />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-full border border-primary/20 border-dashed"
          />
          {/* Online indicator */}
          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-secondary border-2 border-background shadow-teal-sm" />
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black mb-4 tracking-tight"
        >
          <span className="gradient-text">{mockProfile.name}</span>
        </motion.h1>

        {/* Tagline — typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-xl md:text-2xl mb-4 font-light min-h-[2rem] flex items-center justify-center"
        >
          <TypewriterText />
        </motion.div>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-2xl text-muted-foreground leading-relaxed mb-10"
        >
          {mockProfile.bio}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center mb-12"
        >
          <a href="#projects" className="btn-glow px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2">
            View Projects
            <ArrowDown className="w-4 h-4" />
          </a>
          <a
            href={mockProfile.resumeUrl}
            className="glass px-8 py-3 rounded-xl font-semibold text-foreground flex items-center gap-2 hover:border-primary/30 transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Download CV
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 mb-16"
        >
          {[
            { icon: Github, href: mockProfile.githubUrl, label: "GitHub" },
            { icon: Linkedin, href: mockProfile.linkedinUrl, label: "LinkedIn" },
            { icon: Twitter, href: mockProfile.twitterUrl, label: "Twitter" },
            { icon: Mail, href: `mailto:${mockProfile.email}`, label: "Email" },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={label !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={label}
              className="w-11 h-11 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
        >
          {mockStats.map((stat) => {
            const Icon = statIcons[stat.icon];
            return (
              <div key={stat.label} className="glass p-4 rounded-2xl text-center">
                {Icon && <Icon className="w-5 h-5 text-secondary mx-auto mb-2" />}
                <div className="text-2xl font-black gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  );
}
