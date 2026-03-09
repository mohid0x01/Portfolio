import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Code2, ExternalLink } from "lucide-react";

const navLinks = [
  { href: "#projects",   label: "Projects"   },
  { href: "#techstack",  label: "Stack"      },
  { href: "#experience", label: "Experience" },
  { href: "#skills",     label: "Skills"     },
  { href: "#contact",    label: "Contact"    },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 glass border-t-0 rounded-none border-l-0 border-r-0 backdrop-blur-xl"
      style={{ borderBottom: "1px solid var(--glass-border)" }}
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 font-black text-lg">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--gradient-primary)" }}>
          <Code2 className="w-4 h-4 text-white" />
        </div>
        <span className="gradient-text">mohid.sec</span>
      </a>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            {link.label}
          </a>
        ))}
        <a
          href="/admin"
          className="ml-3 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium glass hover:border-primary/30 text-muted-foreground hover:text-primary transition-all"
        >
          Admin
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden w-9 h-9 glass rounded-xl flex items-center justify-center"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 mx-4 glass p-4 flex flex-col gap-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/admin"
              className="px-4 py-3 rounded-xl text-sm font-medium text-primary border border-primary/20 bg-primary/5"
            >
              Admin Panel
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
