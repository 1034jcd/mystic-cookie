import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CookieProps {
  isCracked: boolean;
  fortuneText: string | null;
  onCrack: () => void;
}

export function Cookie({ isCracked, fortuneText, onCrack }: CookieProps) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!isCracked) return;
    setShowParticles(true);
    const t = setTimeout(() => setShowParticles(false), 1500);
    return () => clearTimeout(t);
  }, [isCracked]);

  return (
    <div
      className="relative mx-auto cursor-pointer group z-10 flex flex-col items-center"
      style={{ width: 300, height: 300 }}
      onClick={!isCracked ? onCrack : undefined}
      data-testid="cookie-container"
    >
      {/* Ambient floor glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -30, left: '50%', transform: 'translateX(-50%)',
          width: 260, height: 60,
          background: 'radial-gradient(ellipse, rgba(212,175,116,0.35) 0%, transparent 70%)',
          filter: 'blur(12px)',
          transition: 'opacity 0.5s',
          opacity: isCracked ? 0 : 1,
        }}
      />

      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: 300, height: 300 }}
        animate={isCracked ? { y: 0 } : { y: [-10, 6, -10] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }}
      >
        {/* Breathe glow ring when idle */}
        {!isCracked && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 38% 35%, rgba(255,244,214,0.18) 0%, rgba(212,175,116,0.10) 35%, transparent 65%)',
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Group hover ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-700"
          style={{
            boxShadow: '0 0 0 0 rgba(212,175,116,0)',
          }}
        />

        {/* Fortune Slip */}
        {isCracked && fortuneText && (
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            style={{ transformOrigin: 'top center', zIndex: 10 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80"
            data-testid="fortune-slip"
          >
            {/* Top curl */}
            <div style={{
              height: 18,
              marginInline: 16,
              borderRadius: '50% 50% 0 0',
              background: 'linear-gradient(180deg, #a07835 0%, #c8a355 40%, #f0d9a8 100%)',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.3)',
            }} />
            {/* Parchment body */}
            <div style={{
              background: 'linear-gradient(170deg, #fdf3d9 0%, #f5e4b8 20%, #eedca8 50%, #f0e0b4 75%, #e8d498 100%)',
              borderLeft: '3px solid #c8a040',
              borderRight: '3px solid #c8a040',
              padding: '20px 24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.55), inset 0 0 30px rgba(139,90,43,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
              position: 'relative',
            }}>
              {/* Paper grain overlay */}
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                pointerEvents: 'none',
              }} />
              {/* Ornamental top rule */}
              <div style={{ textAlign: 'center', color: '#a07835', fontSize: 10, letterSpacing: 6, marginBottom: 10 }}>
                ✦ ─────────────── ✦
              </div>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.9 }}
                style={{
                  fontFamily: "'IM Fell English', Georgia, serif",
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  color: '#1a0e00',
                  textAlign: 'center',
                  lineHeight: 1.65,
                }}
              >
                "{fortuneText}"
              </motion.p>
              {/* Ornamental bottom rule */}
              <div style={{ textAlign: 'center', color: '#a07835', fontSize: 10, letterSpacing: 6, marginTop: 10 }}>
                ✦ ─────────────── ✦
              </div>
            </div>
            {/* Bottom curl */}
            <div style={{
              height: 18,
              marginInline: 16,
              borderRadius: '0 0 50% 50%',
              background: 'linear-gradient(0deg, #a07835 0%, #c8a355 40%, #f0d9a8 100%)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            }} />
          </motion.div>
        )}

        {/* === TOP HALF OF COOKIE === */}
        <motion.svg
          viewBox="0 0 240 130"
          animate={isCracked
            ? { rotate: -28, x: -55, y: -45, opacity: 0, scale: 0.9 }
            : { rotate: 0, x: 0, y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            top: 20,
            left: 0,
            width: '100%',
            height: 150,
            zIndex: 20,
            filter: isCracked ? 'none' : 'drop-shadow(0 -6px 18px rgba(212,175,116,0.35)) drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
            overflow: 'visible',
            transformOrigin: '30% 90%',
          }}
        >
          <defs>
            {/* Main gold gradient - radial for 3D dome effect */}
            <radialGradient id="topCookieGrad" cx="38%" cy="28%" r="65%" fx="38%" fy="28%">
              <stop offset="0%" stopColor="#fff4d6" />
              <stop offset="15%" stopColor="#f5d896" />
              <stop offset="40%" stopColor="#d4af74" />
              <stop offset="65%" stopColor="#b8924a" />
              <stop offset="85%" stopColor="#8b6420" />
              <stop offset="100%" stopColor="#6b4a18" />
            </radialGradient>
            {/* Specular highlight gradient */}
            <radialGradient id="topSpecular" cx="32%" cy="22%" r="35%">
              <stop offset="0%" stopColor="rgba(255,252,235,0.75)" />
              <stop offset="40%" stopColor="rgba(255,244,180,0.30)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            {/* Edge rim light */}
            <linearGradient id="topRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,240,180,0.5)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            {/* Shadow at base of top half */}
            <linearGradient id="topBaseShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
            </linearGradient>
          </defs>

          {/* Main cookie body - top half */}
          <path
            d="M 38 128 C 32 100, 20 68, 22 40 C 28 12, 60 2, 120 2 C 180 2, 212 12, 218 40 C 220 68, 208 100, 202 128 C 170 112, 70 112, 38 128 Z"
            fill="url(#topCookieGrad)"
            stroke="#7a5520"
            strokeWidth="1.5"
          />
          {/* Specular highlight layer */}
          <path
            d="M 38 128 C 32 100, 20 68, 22 40 C 28 12, 60 2, 120 2 C 180 2, 212 12, 218 40 C 220 68, 208 100, 202 128 C 170 112, 70 112, 38 128 Z"
            fill="url(#topSpecular)"
          />
          {/* Rim light */}
          <path
            d="M 38 128 C 32 100, 20 68, 22 40 C 28 12, 60 2, 120 2 C 180 2, 212 12, 218 40 C 220 68, 208 100, 202 128 C 170 112, 70 112, 38 128 Z"
            fill="url(#topRim)"
            opacity="0.6"
          />
          {/* Shadow base */}
          <path
            d="M 38 128 C 70 112, 170 112, 202 128 C 200 118, 40 118, 38 128 Z"
            fill="url(#topBaseShadow)"
          />
          {/* Crease line on top half - dark seam */}
          <path
            d="M 48 126 C 80 116, 160 116, 192 126"
            fill="none"
            stroke="#3d2200"
            strokeWidth="2.5"
            opacity="0.6"
          />
          {/* Crease highlight just above */}
          <path
            d="M 50 122 C 82 113, 158 113, 190 122"
            fill="none"
            stroke="rgba(255,220,120,0.4)"
            strokeWidth="1.5"
          />
        </motion.svg>

        {/* === BOTTOM HALF OF COOKIE === */}
        <motion.svg
          viewBox="0 0 240 140"
          animate={isCracked
            ? { rotate: 25, x: 55, y: 45, opacity: 0, scale: 0.9 }
            : { rotate: 0, x: 0, y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            top: 145,
            left: 0,
            width: '100%',
            height: 155,
            zIndex: 20,
            filter: isCracked ? 'none' : 'drop-shadow(0 12px 24px rgba(0,0,0,0.6)) drop-shadow(0 4px 8px rgba(212,175,116,0.2))',
            overflow: 'visible',
            transformOrigin: '70% 10%',
          }}
        >
          <defs>
            <radialGradient id="botCookieGrad" cx="62%" cy="75%" r="65%" fx="62%" fy="75%">
              <stop offset="0%" stopColor="#c8a050" />
              <stop offset="30%" stopColor="#b08038" />
              <stop offset="60%" stopColor="#8b6220" />
              <stop offset="85%" stopColor="#6b4810" />
              <stop offset="100%" stopColor="#4a3008" />
            </radialGradient>
            <radialGradient id="botSpecular" cx="68%" cy="72%" r="28%">
              <stop offset="0%" stopColor="rgba(255,230,140,0.45)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <linearGradient id="botTopHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,210,80,0.35)" />
              <stop offset="40%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            {/* Ambient occlusion at top where halves meet */}
            <linearGradient id="botTopAO" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
              <stop offset="30%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>

          {/* Main bottom body */}
          <path
            d="M 38 12 C 70 28, 170 28, 202 12 C 226 55, 210 105, 170 128 C 140 138, 100 140, 70 128 C 30 105, 14 55, 38 12 Z"
            fill="url(#botCookieGrad)"
            stroke="#5a3810"
            strokeWidth="1.5"
          />
          {/* Specular */}
          <path
            d="M 38 12 C 70 28, 170 28, 202 12 C 226 55, 210 105, 170 128 C 140 138, 100 140, 70 128 C 30 105, 14 55, 38 12 Z"
            fill="url(#botSpecular)"
          />
          {/* Top highlight where halves meet */}
          <path
            d="M 38 12 C 70 28, 170 28, 202 12 C 200 22, 40 22, 38 12 Z"
            fill="url(#botTopHighlight)"
          />
          {/* Ambient occlusion - dark where halves join */}
          <path
            d="M 38 12 C 70 28, 170 28, 202 12 C 200 22, 40 22, 38 12 Z"
            fill="url(#botTopAO)"
          />
          {/* Crease top line */}
          <path
            d="M 44 14 C 80 28, 160 28, 196 14"
            fill="none"
            stroke="rgba(255,200,80,0.4)"
            strokeWidth="1.5"
          />
        </motion.svg>

        {/* Crack flash effect */}
        {showParticles && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-full z-40"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ background: 'radial-gradient(circle, rgba(255,244,180,0.9), transparent 60%)' }}
          />
        )}

        {/* Gold shard particle burst */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * 360 + (Math.random() * 22 - 11);
              const dist = 70 + Math.random() * 90;
              const dx = Math.cos((angle * Math.PI) / 180) * dist;
              const dy = Math.sin((angle * Math.PI) / 180) * dist;
              const isLarge = i % 3 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                  animate={{ x: dx, y: dy + 30, opacity: 0, scale: 0.1, rotate: angle * 2 }}
                  transition={{ duration: 0.8 + Math.random() * 0.4, ease: [0.2, 0.8, 0.4, 1], delay: i * 0.025 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: isLarge ? 14 : 7,
                    height: isLarge ? 14 : 7,
                    borderRadius: isLarge ? '30%' : '50%',
                    background: isLarge
                      ? 'linear-gradient(135deg, #fff4d6, #d4af74, #8b6420)'
                      : 'radial-gradient(circle, #f5d896, #d4af74)',
                    boxShadow: isLarge ? '0 0 6px rgba(212,175,116,0.8)' : 'none',
                  }}
                />
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Oracle hint */}
      {!isCracked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-center text-xs tracking-[0.35em] uppercase select-none absolute -bottom-14 whitespace-nowrap"
          style={{ color: 'rgba(212,175,116,0.65)', fontFamily: "'Cinzel', serif", letterSpacing: '0.3em' }}
        >
          ✦ Tap to Consult the Oracle ✦
        </motion.p>
      )}
    </div>
  );
}
