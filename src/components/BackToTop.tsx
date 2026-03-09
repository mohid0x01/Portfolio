import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.12, y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label="Back to top"
          className="fixed bottom-28 right-8 z-[60] w-11 h-11 rounded-2xl glass flex items-center justify-center border border-primary/30
            hover:border-primary/70 transition-colors duration-300"
          style={{
            boxShadow: "0 0 20px hsl(261 87% 50% / 0.35), 0 4px 20px rgba(0,0,0,0.4)",
            background: "linear-gradient(135deg, hsl(261 87% 50% / 0.18), hsl(162 72% 46% / 0.1))",
          }}
        >
          {/* Animated ring */}
          <motion.span
            className="absolute inset-0 rounded-2xl border border-primary/40"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
          <ArrowUp className="w-4 h-4 text-primary" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
