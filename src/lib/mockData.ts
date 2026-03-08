import type { Project, Skill } from "./schemas";

// ─── Real projects from GitHub: github.com/mohidqx ────────────────────────────
export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Indus Trails Online",
    description:
      "A full-featured travel & tourism web platform for exploring Pakistan's historic Indus trails. Built with a modern TypeScript stack, supporting dynamic listings, itineraries, and user journeys.",
    techStack: ["TypeScript", "React", "Tailwind CSS", "Vite"],
    githubUrl: "https://github.com/mohidqx/indus-trails-online-7d2b34c3",
    liveDemoUrl: "",
    imageUrl: "",
    featured: true,
    order: 0,
    createdAt: "2026-01-07",
  },
  {
    id: "2",
    title: "NetReaper",
    description:
      "Advanced network reconnaissance and analysis tool designed for ethical hackers and penetration testers. Automates host discovery, port scanning, and service fingerprinting workflows.",
    techStack: ["Python", "Nmap", "Socket", "Bash", "CLI"],
    githubUrl: "https://github.com/mohidqx/NetReaper",
    liveDemoUrl: "",
    imageUrl: "",
    featured: true,
    order: 1,
    createdAt: "2025-10-01",
  },
  {
    id: "3",
    title: "AI Chatbot",
    description:
      "Intelligent conversational AI chatbot leveraging modern LLM APIs. Features context-aware multi-turn dialogue, customizable personas, and a clean chat UI for seamless interaction.",
    techStack: ["Python", "OpenAI API", "JavaScript", "HTML", "CSS"],
    githubUrl: "https://github.com/mohidqx/AI-Chatbot",
    liveDemoUrl: "",
    imageUrl: "",
    featured: true,
    order: 2,
    createdAt: "2025-09-01",
  },
  {
    id: "4",
    title: "Recon-Subdomain",
    description:
      "Passive & active subdomain enumeration tool for bug bounty hunters. Aggregates data from multiple OSINT sources, DNS brute-forcing, and certificate transparency logs to map attack surfaces.",
    techStack: ["Python", "DNS", "OSINT", "Bash", "API Integration"],
    githubUrl: "https://github.com/mohidqx/Recon-Subdomain",
    liveDemoUrl: "",
    imageUrl: "",
    featured: false,
    order: 3,
    createdAt: "2025-08-01",
  },
  {
    id: "5",
    title: "Electromyography & Neuromuscular Disorders",
    description:
      "Interactive web resource embedding the 3rd Edition of 'Electromyography and Neuromuscular Disorders'. A reference platform bridging medical knowledge and accessible web technology.",
    techStack: ["HTML", "CSS", "JavaScript"],
    githubUrl:
      "https://github.com/mohidqx/Electromyography-and-Neuromuscular-Disorders",
    liveDemoUrl: "",
    imageUrl: "",
    featured: false,
    order: 4,
    createdAt: "2026-02-26",
  },
  {
    id: "6",
    title: "TeamCyberOps — Org Profile",
    description:
      "GitHub organization profile and README for TeamCyberOps, a cybersecurity collective focused on ethical hacking, CTF challenges, and open-source security tooling. Monitor & Protect.",
    techStack: ["Markdown", "GitHub Actions", "YAML"],
    githubUrl: "https://github.com/mohidqx/.github",
    liveDemoUrl: "",
    imageUrl: "",
    featured: false,
    order: 5,
    createdAt: "2025-12-11",
  },
];

// ─── Skills — CEH-focused ─────────────────────────────────────────────────────
export const mockSkills: Skill[] = [
  // Offensive Security
  { id: "s1", name: "Penetration Testing", level: 90, category: "backend" },
  { id: "s2", name: "Bug Bounty Hunting", level: 88, category: "backend" },
  { id: "s3", name: "Network Reconnaissance", level: 85, category: "backend" },
  { id: "s4", name: "Web App Security (OWASP)", level: 87, category: "backend" },
  { id: "s5", name: "Exploit Development", level: 75, category: "backend" },
  // Tools & Platforms
  { id: "s6", name: "Nmap / Masscan", level: 92, category: "devops" },
  { id: "s7", name: "Burp Suite", level: 88, category: "devops" },
  { id: "s8", name: "Metasploit", level: 82, category: "devops" },
  { id: "s9", name: "Wireshark", level: 85, category: "devops" },
  { id: "s10", name: "Linux / Kali", level: 90, category: "devops" },
  // Development
  { id: "s11", name: "Python", level: 88, category: "frontend" },
  { id: "s12", name: "TypeScript / React", level: 78, category: "frontend" },
  { id: "s13", name: "Bash Scripting", level: 85, category: "frontend" },
  { id: "s14", name: "OSINT Techniques", level: 90, category: "frontend" },
];

// ─── Profile ──────────────────────────────────────────────────────────────────
export const mockProfile = {
  name: "Muhammad Mohid",
  tagline: "Certified Ethical Hacker & Bug Bounty Hunter",
  bio: "I hunt vulnerabilities before the bad guys do. CEH-certified ethical hacker and active bug bounty researcher — securing systems, uncovering attack surfaces, and building offensive security tooling that matters.",
  location: "Pakistan",
  email: "Mohid.qx@proton.me",
  githubUrl: "https://github.com/mohidqx",
  linkedinUrl: "https://linkedin.com/in/mohidqx",
  twitterUrl: "https://twitter.com/cyberops_r00t",
  resumeUrl: "#",
  avatarUrl: "",
};

// ─── Stats ────────────────────────────────────────────────────────────────────
export const mockStats = [
  { label: "Public Repos", value: "20+", icon: "Layers" },
  { label: "Bugs Reported", value: "50+", icon: "Star" },
  { label: "CEH Certified", value: "✓", icon: "Calendar" },
  { label: "Tools Built", value: "10+", icon: "GitMerge" },
];
