import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Ghost, Zap, Shield, AlertTriangle, Loader2, Terminal } from "lucide-react";

interface GhostAuthProps {
  onAuthenticated: (userId: string) => void;
}

const HACKER_CODENAMES = [
  "SHADOW", "CIPHER", "PHANTOM", "RECON", "ZERO_DAY", "EXPLOIT", "VIPER",
  "GHOST", "ORACLE", "WRAITH", "SPECTER", "NEXUS", "VOID", "APEX", "VECTOR",
  "BREACH", "SENTINEL", "ECLIPSE", "ROGUE", "DAEMON", "KERNEL", "PROXY",
  "STYX", "NOVA", "VORTEX", "ENTROPY", "MIRAGE", "BLAZE", "ATLAS", "TITAN",
  "RAZOR", "STORM", "FALCON", "COBRA", "DUSK", "FLUX", "GLITCH", "BINARY",
];

function randomCodename() {
  const base = HACKER_CODENAMES[Math.floor(Math.random() * HACKER_CODENAMES.length)];
  const suffix = Math.floor(Math.random() * 900) + 100;
  return `${base}_${suffix}`;
}

const BOOT_LINES = [
  "> INITIALIZING GHOST PROTOCOL v3.0...",
  "> ENCRYPTING TUNNEL... OK",
  "> ANONYMIZING IDENTITY... OK",
  "> SECURE CHANNEL READY",
];

export function GhostAuth({ onAuthenticated }: GhostAuthProps) {
  const [codename, setCodename] = useState(randomCodename());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bootLine, setBootLine] = useState(0);

  const handleAnonymousJoin = async () => {
    if (!codename.trim()) return;
    setError("");
    setLoading(true);

    // Animate boot lines
    for (let i = 0; i < BOOT_LINES.length; i++) {
      await new Promise((r) => setTimeout(r, 350));
      setBootLine(i);
    }

    try {
      // Try anonymous sign in first
      const { data, error: anonError } = await supabase.auth.signInAnonymously();

      if (anonError) {
        // Fallback: create a throwaway account with random credentials
        const throwaway = `ghost_${Date.now()}_${Math.random().toString(36).slice(2)}@ghost.protocol`;
        const pw = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + "Aa1!";
        const { data: signupData, error: signupErr } = await supabase.auth.signUp({
          email: throwaway,
          password: pw,
        });
        if (signupErr || !signupData.user) {
          setError("FAILED TO ESTABLISH SECURE TUNNEL. RETRY.");
          setLoading(false);
          return;
        }
        // Store codename in localStorage keyed by user id
        localStorage.setItem(`ghost_codename_${signupData.user.id}`, codename.trim().toUpperCase());
        onAuthenticated(signupData.user.id);
        return;
      }

      if (!data.user) {
        setError("ANONYMOUS SESSION FAILED. RETRY.");
        setLoading(false);
        return;
      }

      localStorage.setItem(`ghost_codename_${data.user.id}`, codename.trim().toUpperCase());
      onAuthenticated(data.user.id);
    } catch {
      setError("NETWORK ERROR. CHECK CONNECTION.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono">
      {/* Terminal boot animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm mb-6"
      >
        <div className="bg-black/60 border border-secondary/20 rounded-xl p-4 font-mono text-xs space-y-1">
          {BOOT_LINES.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= bootLine ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={i <= bootLine ? "text-secondary" : "text-muted-foreground/30"}
            >
              {line}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <div className="glass rounded-2xl p-6 border border-primary/20">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(261 87% 50% / 0.3), hsl(162 72% 46% / 0.2))" }}
            >
              <Ghost className="w-8 h-8 text-primary" />
            </motion.div>
          </div>

          <h3 className="text-center font-black tracking-widest mb-1 gradient-text text-xl">
            GHOST PROTOCOL
          </h3>
          <p className="text-center text-xs text-muted-foreground mb-6 leading-relaxed">
            ANONYMOUS · ENCRYPTED · NO REGISTRATION<br />
            <span className="text-secondary/70">PICK A CODENAME AND ENTER THE NETWORK</span>
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4"
              >
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Codename input */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-2 block tracking-widest flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-secondary" />
              YOUR CODENAME
            </label>
            <div className="relative">
              <input
                type="text"
                value={codename}
                onChange={(e) => setCodename(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                placeholder="SHADOW_404"
                maxLength={20}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleAnonymousJoin()}
                className="w-full bg-white/5 border border-primary/20 rounded-xl px-4 py-3 pr-12 text-sm font-mono font-bold text-primary placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors tracking-widest"
              />
              <button
                type="button"
                onClick={() => setCodename(randomCodename())}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                title="Randomize codename"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-1.5">Only letters, numbers, underscores. Max 20 chars.</p>
          </div>

          {/* Enter button */}
          <motion.button
            onClick={handleAnonymousJoin}
            disabled={loading || !codename.trim()}
            whileTap={{ scale: 0.97 }}
            className="w-full btn-glow py-3 rounded-xl font-black tracking-widest text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                ESTABLISHING TUNNEL...
              </>
            ) : (
              <>
                <Ghost className="w-4 h-4" />
                ENTER AS {codename || "GHOST"}
              </>
            )}
          </motion.button>

          {/* Info badges */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: "👻", label: "ANONYMOUS" },
              { icon: "🔒", label: "ENCRYPTED" },
              { icon: "⚡", label: "INSTANT" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-white/3 border border-border/20">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-mono font-bold text-muted-foreground tracking-wider">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground/40 mt-4 font-mono">
            NO EMAIL · NO PASSWORD · NO TRACE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
