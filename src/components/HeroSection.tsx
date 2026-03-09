import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Download, ArrowDown, Shield, Sparkles } from "lucide-react";
import { mockProfile, mockStats } from "@/lib/mockData";
import mohidAvatar from "@/assets/mohid-avatar.png";
import { useState, useEffect } from "react";
import { HeroParticles } from "@/components/HeroParticles";

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

const STAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroParticles />

      {/* Deep layered background */}
      <div className="absolute inset-0 bg-hero-glow" style={{ zIndex: 0 }} />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-10 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ zIndex: 1, background: "radial-gradient(circle, hsl(261 87% 50% / 0.18), transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{ zIndex: 1, background: "radial-gradient(circle, hsl(162 72% 46% / 0.18), transparent 70%)" }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          zIndex: 2,
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center text-center">

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-10 text-sm border border-secondary/20 shadow-[0_0_30px_hsl(162_72%_46%_/_0.15)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
          </span>
          <span className="text-muted-foreground">CEH Certified</span>
          <span className="w-px h-3 bg-border" />
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span className="text-secondary font-medium">{mockProfile.location}</span>
        </motion.div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.1 }}
          className="relative mb-10"
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-4 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, hsl(261 87% 50% / 0.4), transparent 70%)" }}
          />
          {/* Spinning dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-3 rounded-full border border-primary/25 border-dashed"
          />
          {/* Spinning teal ring (opposite) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-5 rounded-full border border-secondary/15 border-dashed"
            style={{ borderSpacing: "8px" }}
          />
          <div className="w-36 h-36 rounded-full overflow-hidden relative animate-pulse-glow border-2 border-primary/40 shadow-[0_0_40px_hsl(261_87%_50%_/_0.3)]">
            <img src={mohidAvatar} alt="Muhammad Mohid" className="w-full h-full object-cover" />
            <div className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(135deg, hsl(261 87% 50% / 0.12), transparent 60%)" }}
            />
          </div>
          {/* Online dot */}
          <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary border-2 border-background shadow-[0_0_10px_hsl(162_72%_46%_/_0.8)]" />
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-black mb-5 tracking-tight leading-none"
        >
          <span className="gradient-text">{mockProfile.name}</span>
        </motion.h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-xl md:text-2xl mb-5 font-light min-h-[2.25rem] flex items-center justify-center"
        >
          <TypewriterText />
        </motion.div>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-2xl text-muted-foreground leading-relaxed mb-12 text-base md:text-lg"
        >
          {mockProfile.bio}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center mb-14"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="relative btn-glow px-8 py-3.5 rounded-2xl font-bold text-white flex items-center gap-2 text-sm overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            View Projects
            <ArrowDown className="w-4 h-4" />
          </motion.a>
          <motion.a
            href="/bug-bounty"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="glass px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 text-sm
              border border-secondary/25 text-secondary
              hover:border-secondary/50 hover:shadow-[0_0_30px_hsl(162_72%_46%_/_0.25)] transition-all duration-300"
          >
            <Shield className="w-4 h-4" />
            Bug Bounty
          </motion.a>
          <motion.a
            href={mockProfile.resumeUrl}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="glass px-8 py-3.5 rounded-2xl font-bold text-foreground flex items-center gap-2 text-sm
              border border-border/30 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(261_87%_50%_/_0.15)] transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Download CV
          </motion.a>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex gap-3 mb-16"
        >
          {[
            { icon: Github, href: mockProfile.githubUrl, label: "GitHub", color: "hover:text-foreground hover:border-foreground/30" },
            { icon: Linkedin, href: mockProfile.linkedinUrl, label: "LinkedIn", color: "hover:text-blue-400 hover:border-blue-400/30" },
            { icon: Twitter, href: mockProfile.twitterUrl, label: "Twitter", color: "hover:text-sky-400 hover:border-sky-400/30" },
            { icon: Mail, href: `mailto:${mockProfile.email}`, label: "Email", color: "hover:text-secondary hover:border-secondary/30" },
          ].map(({ icon: Icon, href, label, color }) => (
            <motion.a
              key={label}
              href={href}
              target={label !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={label}
              whileHover={{ scale: 1.12, y: -3 }}
              whileTap={{ scale: 0.92 }}
              className={`w-11 h-11 glass rounded-xl flex items-center justify-center text-muted-foreground border border-border/20 ${color} transition-all duration-300`}
            >
              <Icon className="w-4.5 h-4.5" />
            </motion.a>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
        >
          {mockStats.map((stat, i) => {
            const Icon = STAT_ICONS[stat.icon];
            return (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass p-5 rounded-2xl text-center border border-border/20
                  hover:border-primary/25 hover:shadow-[0_0_30px_hsl(261_87%_50%_/_0.15)] transition-all duration-300 group"
              >
                {Icon && <Icon className="w-5 h-5 text-secondary mx-auto mb-2.5 group-hover:scale-110 transition-transform duration-300" />}
                <div className="text-2xl font-black gradient-text leading-none mb-1">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground tracking-wide">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
        </motion.div>
      </div>
    </section>
  );
}
