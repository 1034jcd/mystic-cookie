import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, delay: 2.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]"
    >
      <div className="relative flex items-center justify-center">
        {/* Animated Rings */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          className="absolute rounded-full border border-primary pointer-events-none"
          style={{ width: 160, height: 160 }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute rounded-full border border-primary pointer-events-none"
          style={{ width: 240, height: 240 }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
          className="absolute rounded-full border border-primary pointer-events-none"
          style={{ width: 320, height: 320 }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [1.05, 1] }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="text-[8rem] text-primary drop-shadow-[0_0_20px_rgba(212,175,116,0.5)] font-serif leading-none relative z-10"
        >
          命
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-3xl text-primary mt-8 relative z-10"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        Mystic Cookie
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-sm text-muted-foreground mt-4 tracking-widest flex items-center relative z-10"
      >
        Seeking your destiny
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="inline-block w-4"
        >
          ...
        </motion.span>
      </motion.p>
    </motion.div>
  );
}
