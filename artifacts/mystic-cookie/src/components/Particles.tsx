import { useEffect, useRef } from "react";

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particle types
    type P = {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      alpha: number; targetAlpha: number;
      twinkleSpeed: number; twinklePhase: number;
      type: "orb" | "star" | "dust";
      color: string;
    };

    const goldColors = ["#d4af74", "#f5d896", "#b8924a", "#ffe8a0", "#c8a050"];
    const dustColors = ["#d4af74cc", "#00d4a840", "#c8a05088"];

    const particles: P[] = [];

    // Large gold orbs (slow, glowing)
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.2 + 0.05),
        size: Math.random() * 3.5 + 2.5,
        alpha: 0, targetAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.008 + 0.004,
        twinklePhase: Math.random() * Math.PI * 2,
        type: "orb",
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
      });
    }

    // Medium star particles
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.4 + 0.15),
        size: Math.random() * 1.5 + 0.8,
        alpha: 0, targetAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        type: "star",
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
      });
    }

    // Fine dust particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(Math.random() * 0.6 + 0.2),
        size: Math.random() * 0.9 + 0.3,
        alpha: 0, targetAlpha: Math.random() * 0.35 + 0.1,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        type: "dust",
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
      });
    }

    function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
      const spikes = 4;
      const outerR = r;
      const innerR = r * 0.4;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(x, y - outerR);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(x + Math.cos(rot) * outerR, y + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(x + Math.cos(rot) * innerR, y + Math.sin(rot) * innerR);
        rot += step;
      }
      ctx.closePath();
    }

    let animId: number;
    let t = 0;
    const H = () => canvas.height;
    const W = () => canvas.width;

    function animate() {
      ctx!.clearRect(0, 0, W(), H());
      t += 0.016;

      for (const p of particles) {
        p.twinklePhase += p.twinkleSpeed;
        const tAlpha = p.targetAlpha * (0.6 + 0.4 * Math.sin(p.twinklePhase));
        p.alpha += (tAlpha - p.alpha) * 0.05;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.y < -20) { p.y = H() + 20; p.x = Math.random() * W(); }
        if (p.x < -20) p.x = W() + 20;
        if (p.x > W() + 20) p.x = -20;

        ctx!.save();
        ctx!.globalAlpha = Math.max(0, Math.min(1, p.alpha));

        if (p.type === "orb") {
          const grad = ctx!.createRadialGradient(p.x - p.size * 0.3, p.y - p.size * 0.3, 0, p.x, p.y, p.size * 2.5);
          grad.addColorStop(0, "rgba(255,244,200,0.9)");
          grad.addColorStop(0.3, p.color + "cc");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx!.fill();
          // Bright core
          ctx!.fillStyle = "rgba(255,252,230,0.95)";
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx!.fill();
        } else if (p.type === "star") {
          ctx!.fillStyle = p.color;
          ctx!.shadowColor = p.color;
          ctx!.shadowBlur = p.size * 4;
          drawStar(ctx!, p.x, p.y, p.size * 1.8);
          ctx!.fill();
          ctx!.shadowBlur = 0;
        } else {
          ctx!.fillStyle = p.color;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.restore();
      }
      animId = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.75 }}
    />
  );
}