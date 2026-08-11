import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#d4af74", "#f5d896", "#fff4d6", "#8b6914", "#00d4a8", "#b8924a"];
const SHAPES = ["rect", "circle", "diamond"] as const;

function useReducedMotion() {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
}

export function GoldConfetti({ trigger }: { trigger: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.1 + Math.random() * 0.9,
        size: 5 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 90,
        shape: SHAPES[i % SHAPES.length],
      })),
    [trigger]
  );

  if (reduce || trigger === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={`${trigger}-${i}`}
          initial={{ y: "-5vh", x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", x: p.drift, opacity: [1, 1, 0.85, 0], rotate: p.rotation * 2 }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.22, 0.6, 0.4, 1] }}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.shape === "circle" ? p.size * 0.8 : p.size,
            height: p.shape === "rect" ? p.size * 0.45 : p.size,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "diamond" ? "2px" : 2,
            transform: `rotate(${p.rotation}deg)`,
            boxShadow: "0 0 8px rgba(212,175,116,0.55)",
          }}
        />
      ))}
    </div>
  );
}
