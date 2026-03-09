import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

interface BinaryDrop {
  x: number; y: number;
  chars: string[];
  speed: number;
  alpha: number;
  color: string;
  length: number;
}

const COLORS = [
  "102, 16, 242",   // indigo --primary
  "32, 201, 151",   // teal --secondary
  "102, 16, 242",   // indigo again (weighted)
  "150, 80, 255",   // light indigo
];

const BINARY = "01アイウエオアイウエ10011010";

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;

    const particles: Particle[] = [];
    const drops: BinaryDrop[] = [];

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn particles
    const PARTICLE_COUNT = Math.min(60, Math.floor((W * H) / 18000));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 2.5 + 0.8,
        color,
        alpha: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    // Spawn binary drops (slow, sparse)
    const spawnDrop = () => {
      const color = Math.random() > 0.5 ? "32, 201, 151" : "102, 16, 242";
      drops.push({
        x: Math.random() * W,
        y: -80,
        chars: Array.from({ length: Math.floor(Math.random() * 8) + 4 }, () =>
          BINARY[Math.floor(Math.random() * BINARY.length)]
        ),
        speed: Math.random() * 0.6 + 0.3,
        alpha: Math.random() * 0.18 + 0.06,
        color,
        length: Math.floor(Math.random() * 8) + 4,
      });
    };
    // Initial drops
    for (let i = 0; i < 6; i++) {
      const d = { x: Math.random() * W, y: Math.random() * H, chars: Array.from({ length: 6 }, () => BINARY[Math.floor(Math.random() * BINARY.length)]), speed: Math.random() * 0.6 + 0.3, alpha: Math.random() * 0.18 + 0.06, color: Math.random() > 0.5 ? "32, 201, 151" : "102, 16, 242", length: 6 };
      drops.push(d);
    }

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      ctx.clearRect(0, 0, W, H);

      // Spawn new drops periodically
      if (frameCount % 180 === 0) spawnDrop();

      // Draw connection lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${particles[i].color}, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const pulsedAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
        const pulsedRadius = p.radius + Math.sin(p.pulse) * 0.6;

        // Outer glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsedRadius * 5);
        grd.addColorStop(0, `rgba(${p.color}, ${pulsedAlpha * 0.5})`);
        grd.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulsedRadius * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulsedRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, pulsedAlpha * 1.8)})`;
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
      }

      // Draw binary drops
      ctx.font = "10px monospace";
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        for (let c = 0; c < d.chars.length; c++) {
          const fadeAlpha = d.alpha * (1 - c / d.chars.length);
          ctx.fillStyle = `rgba(${d.color}, ${fadeAlpha})`;
          ctx.fillText(d.chars[c], d.x, d.y - c * 13);
        }
        // Shuffle chars occasionally
        if (frameCount % 30 === 0) {
          const idx = Math.floor(Math.random() * d.chars.length);
          d.chars[idx] = BINARY[Math.floor(Math.random() * BINARY.length)];
        }
        d.y += d.speed;
        if (d.y > H + 100) drops.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
