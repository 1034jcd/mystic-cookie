import React, { useState, useEffect } from "react";
import { useGetWeeklyFortune } from "@workspace/api-client-react";
import { LockKeyhole, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { downloadFortuneCard } from "@/lib/shareCard";

export function WeeklyFortune({ 
  hasAccess, 
  onUnlock, 
  onUnlockSuccess 
}: { 
  hasAccess: boolean;
  onUnlock: () => void;
  onUnlockSuccess?: () => void;
}) {
  const { data, isLoading } = useGetWeeklyFortune();
  const { toast } = useToast();
  
  const [localAccess, setLocalAccess] = useState(false);
  const [showStarburst, setShowStarburst] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const weekNumber = data?.weekNumber;
  const isUnlocked = hasAccess || localAccess;

  useEffect(() => {
    if (weekNumber !== undefined) {
      const stored = localStorage.getItem(`mystic_weekly_${weekNumber}`);
      if (stored === "true") {
        setLocalAccess(true);
      }
    }
  }, [weekNumber]);

  useEffect(() => {
    if (!isUnlocked || !data || showStarburst) return;
    setShowStarburst(true);
    const timer = setTimeout(() => setShowStarburst(false), 2000);
    return () => clearTimeout(timer);
  }, [isUnlocked, data]);

  // When hasAccess from parent becomes true, update localStorage for the week
  useEffect(() => {
    if (hasAccess && weekNumber !== undefined) {
      localStorage.setItem(`mystic_weekly_${weekNumber}`, "true");
      setLocalAccess(true);
      onUnlockSuccess?.();
    }
  }, [hasAccess, weekNumber, onUnlockSuccess]);

  useEffect(() => {
    if (!data?.expiresAt) return;
    const updateCountdown = () => {
      const now = new Date();
      const expires = new Date(data.expiresAt);
      const diff = expires.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${d}d ${h}h left`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60); // every minute
    return () => clearInterval(interval);
  }, [data?.expiresAt]);

  const handleShare = async () => {
    if (!data) return;
    const text = `Oracle's Weekly Prophecy:\n"${data.text}"\n✨ Lucky Numbers: ${data.luckyNumbers.join(', ')}\n\nMystic Cookie`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Weekly Prophecy", text });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to parchment", description: "Fortune copied to clipboard." });
  };

  const handleSaveToCard = () => {
    if (!data) return;
    downloadFortuneCard({
      text: data.text,
      category: data.category,
      luckyNumbers: data.luckyNumbers,
      weekLabel: data.weekLabel
    });
  };

  if (isLoading || !data) {
    return (
      <div className="w-full bg-[#12121a] rounded-xl p-6 border border-primary/20 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif text-primary">🔮 Oracle's Weekly Prophecy</h2>
        </div>
        <div className="h-[1px] w-full bg-primary/20 mb-6" />
        <div className="space-y-3">
          <div className="h-4 bg-muted/30 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted/30 rounded w-full animate-pulse" />
          <div className="h-4 bg-muted/30 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#12121a] rounded-xl p-6 border border-primary/20 shadow-lg relative overflow-hidden">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(100%) skewX(-12deg); }
        }
      `}</style>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif text-primary">🔮 Oracle's Weekly Prophecy</h2>
        <span className="text-xs text-muted-foreground">{data.weekLabel}</span>
      </div>
      <div className="h-[1px] w-full bg-primary/20 mb-6" />

      {!isUnlocked ? (
        <div className="relative text-center py-6 overflow-hidden">
          <div className="filter blur-[6px] opacity-60 text-lg font-serif italic text-primary/80 select-none">
            Your destiny this week holds great...<br />
            The path ahead is shrouded in mystery,<br />
            but secrets await those who seek them.
          </div>
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12" style={{ width: '200%', left: '-50%', animation: 'shimmer 3s infinite' }} />
          
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-2">
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <LockKeyhole className="w-8 h-8 text-primary relative z-10" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Unlock This Week's Prophecy</p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-background/50 backdrop-blur-sm" onClick={onUnlock}>
              Reveal for $0.99 or subscribe
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-6">
          <AnimatePresence>
            {showStarburst && (
              <motion.div 
                className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full max-w-[300px]">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.line
                      key={i}
                      x1="100" y1="100"
                      x2={100 + 60 * Math.cos((i * Math.PI) / 4)}
                      y2={100 + 60 * Math.sin((i * Math.PI) / 4)}
                      stroke="#d4af74"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                    />
                  ))}
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-lg text-primary font-serif italic text-center max-w-lg">
            "{data.text}"
          </p>

          <div className="flex flex-col items-center gap-3">
            <Badge variant="secondary" className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/30">
              {data.category}
            </Badge>
            <div className="flex gap-2 mt-2">
              {data.luckyNumbers.map((n, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-sm font-bold border border-secondary/30 shadow-[0_0_10px_rgba(0,212,168,0.2)]">
                  {n}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Expires in: {timeLeft}
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" onClick={handleSaveToCard}>
              <Download className="w-4 h-4 mr-2" /> Save to Card
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}