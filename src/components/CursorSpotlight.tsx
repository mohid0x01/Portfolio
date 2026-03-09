import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -999, y: -999 });
  const raf = useRef<number>(0);
  const { theme } = useTheme();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      if (ref.current) {
        ref.current.style.background = `radial-gradient(600px circle at ${pos.current.x}px ${pos.current.y}px, ${
          theme === "dark"
            ? "hsl(261 87% 50% / 0.07) 0%, hsl(162 72% 46% / 0.03) 40%, transparent 70%"
            : "hsl(261 87% 50% / 0.04) 0%, transparent 60%"
        })`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [theme]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-300"
      aria-hidden="true"
    />
  );
}
