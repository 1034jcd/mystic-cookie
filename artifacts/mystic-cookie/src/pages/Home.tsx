import { useState, useEffect } from "react";
import { Particles } from "@/components/Particles";
import { Cookie } from "@/components/Cookie";
import { PaymentModal } from "@/components/PaymentModal";
import { CollectionDrawer } from "@/components/CollectionDrawer";
import { WeeklyFortune } from "@/components/WeeklyFortune";
import { useFortuneStore, SavedFortune } from "@/hooks/useFortuneStore";
import { playCrackSound, playChimeSound, playPurchaseSound, setSoundEnabled } from "@/lib/audio";
import { 
  useGetDailyFortune, 
  useGetRandomFortune, 
  useGetFortuneCategories,
  getGetRandomFortuneQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, BookmarkPlus, Sparkles, ScrollText, MoonStar, Zap, Info, Volume2, VolumeX, MessageCircle, Twitter, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const store = useFortuneStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("Any");
  const [isCracked, setIsCracked] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<SavedFortune | null>(null);
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<"0.99" | "4.99">("0.99");
  const [paymentIntent, setPaymentIntent] = useState<"random" | "subscription">("random");
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');
  const [weeklyUnlocked, setWeeklyUnlocked] = useState(false);

  const { data: categories } = useGetFortuneCategories();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeUntilMidnight(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Reset cookie state when changing categories (if cracked)
  useEffect(() => {
    if (isCracked) {
      setIsCracked(false);
      setCurrentFortune(null);
    }
  }, [selectedCategory]);

  const handleCrack = async (type: "daily" | "random") => {
    if (isCracked) return;

    try {
      let fortuneData;
      
      if (type === "daily") {
        // Daily fetch
        const res = await queryClient.fetchQuery({
          queryKey: ['/api/fortune/daily'],
          queryFn: () => fetch('/api/fortune/daily').then(r => {
            if (!r.ok) throw new Error("Already claimed daily fortune or error.");
            return r.json();
          })
        });
        fortuneData = res;
      } else {
        // Random fetch with optional category
        const params = selectedCategory !== "Any" ? { category: selectedCategory as any } : undefined;
        const res = await queryClient.fetchQuery({
          queryKey: getGetRandomFortuneQueryKey(params),
          queryFn: () => fetch(`/api/fortune/random${selectedCategory !== 'Any' ? `?category=${selectedCategory}` : ''}`).then(r => r.json())
        });
        fortuneData = res;
      }

      playCrackSound();
      setIsCracked(true);
      setCurrentFortune({
        id: fortuneData.id || Date.now(),
        text: fortuneData.text,
        category: fortuneData.category,
        luckyNumbers: fortuneData.luckyNumbers || [7, 14, 21, 28],
        date: new Date().toISOString()
      });
      
      store.incrementCracked();
      
      setTimeout(() => {
        playChimeSound();
      }, 500);

    } catch (error: any) {
      toast({
        title: "The Oracle is silent",
        description: error.message || "Failed to crack cookie. Try again later.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (!currentFortune) return;
    
    const text = `The Oracle says:\n"${currentFortune.text}"\n✨ Lucky Numbers: ${currentFortune.luckyNumbers.join(', ')}\n\nCracked at Mystic Cookie`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Fortune', text });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to parchment",
      description: "Fortune copied to clipboard.",
    });
  };

  const fortuneShareText = () =>
    currentFortune
      ? `The Oracle says: "${currentFortune.text}" ✨ Lucky Numbers: ${currentFortune.luckyNumbers.join(", ")} — cracked at Mystic Cookie 🥠`
      : "Crack open your fortune at Mystic Cookie 🥠";

  const shareTo = (platform: "whatsapp" | "x" | "facebook") => {
    const text = encodeURIComponent(fortuneShareText());
    const url = encodeURIComponent(window.location.origin);
    const targets: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    };
    window.open(targets[platform], "_blank", "noopener,noreferrer");
  };

  const handleSave = () => {
    if (!currentFortune) return;
    store.saveFortune(currentFortune);
    toast({
      title: "Fortune saved",
      description: "Added to your scroll of memories.",
    });
  };

  const onPaymentConfirmed = () => {
    playPurchaseSound();
    if (paymentIntent === "subscription") {
      store.setSubscriptionActive(true);
      toast({
        title: "Tribute Accepted",
        description: "You now have unlimited monthly fortunes.",
      });
    } else {
      handleCrack("random");
    }
    setWeeklyUnlocked(true);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center relative overflow-x-hidden pt-12 pb-24 px-4">
      <Particles />

      {/* Stats Bar */}
      <div className="absolute top-4 w-full px-4 flex justify-between items-center z-30 max-w-4xl">
        <div className="glass-panel text-xs font-mono px-4 py-2 rounded-full flex gap-4 items-center">
          <span style={{ color: 'rgba(212,175,116,0.8)' }}>Cracked: {store.stats.totalCracked}</span>
          <span style={{ color: 'rgba(212,175,116,0.8)' }}>Saved: {store.savedFortunes.length}</span>
          <span style={{ color: 'rgba(212,175,116,0.8)' }}>Streak: {store.stats.streak}🔥</span>
          {store.subscription.active && (
            <span className="text-secondary font-bold ml-1">∞ Unlimited</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground bg-card/50 backdrop-blur-sm border border-border rounded-full"
            onClick={() => {
              const newState = !soundOn;
              setSoundOn(newState);
              setSoundEnabled(newState);
            }}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-panel border-0 text-primary/80 hover:text-primary"
            onClick={() => setDrawerOpen(true)}
          >
            <ScrollText className="w-4 h-4 mr-2" />
            Collection
          </Button>
        </div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-20 mt-12 mb-8"
      >
        <h1 className="text-gold-shimmer text-4xl md:text-6xl font-serif mb-3">
          Mystic Cookie
        </h1>
        <p className="text-muted-foreground tracking-widest text-sm md:text-base uppercase flex items-center justify-center gap-2 mb-5">
          <MoonStar className="w-4 h-4 text-primary/70" />
          Seek your destiny
          <MoonStar className="w-4 h-4 text-primary/70" />
        </p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9 }}
          className="max-w-lg mx-auto text-sm md:text-base leading-relaxed text-center px-4"
          style={{ fontFamily: "'IM Fell English', Georgia, serif", fontStyle: 'italic', color: 'rgba(212,175,116,0.65)' }}
        >
          These are real, life-changing fortunes. When received with open intention
          and applied through steady focus and daily meditation, each word carries
          the power to shift the course of your life in profound and lasting ways.
        </motion.p>
      </motion.div>

      {/* Category Selector */}
      <div className="z-20 mb-12 flex flex-wrap justify-center gap-2 max-w-xl">
        <Badge 
          variant={selectedCategory === "Any" ? "default" : "outline"}
          className={`cursor-pointer px-4 py-1.5 text-sm transition-all ${selectedCategory === "Any" ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(212,175,116,0.8),0_0_40px_rgba(212,175,116,0.3)] scale-105" : "hover:bg-primary/20"}`}
          onClick={() => setSelectedCategory("Any")}
        >
          ✨ Any
        </Badge>
        {categories?.map((cat) => (
          <Badge 
            key={cat.name}
            variant={selectedCategory === cat.name ? "default" : "outline"}
            className={`cursor-pointer px-4 py-1.5 text-sm transition-all ${selectedCategory === cat.name ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(212,175,116,0.8),0_0_40px_rgba(212,175,116,0.3)] scale-105" : "hover:bg-primary/20"}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            {cat.emoji} {cat.name}
          </Badge>
        ))}
      </div>

      {/* The Cookie */}
      <Cookie 
        isCracked={isCracked} 
        fortuneText={currentFortune?.text || null} 
        onCrack={() => {
          if (store.subscription.active) {
            handleCrack("random");
          } else {
            // Default to daily if they haven't cracked today, otherwise ask for payment
            const today = new Date().toISOString().split('T')[0];
            if (store.stats.lastCrackedDate !== today) {
              handleCrack("daily");
            } else {
              setPaymentIntent("random");
              setPaymentAmount("0.99");
              setPaymentModalOpen(true);
            }
          }
        }} 
      />

      {/* Fortune Actions (Revealed after crack) */}
      <AnimatePresence>
        {isCracked && currentFortune && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="z-20 mt-16 flex flex-col items-center gap-6"
          >
            <div className="flex flex-col items-center gap-3">
              <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                {currentFortune.category}
              </Badge>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Lucky Numbers</span>
                <div className="flex gap-2">
                  {currentFortune.luckyNumbers.map((n, i) => (
                    <span key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, rgba(0,212,168,0.25) 0%, rgba(0,150,120,0.15) 100%)', border: '1px solid rgba(0,212,168,0.5)', boxShadow: '0 0 14px rgba(0,212,168,0.4), inset 0 1px 0 rgba(255,255,255,0.15)', color: '#00d4a8' }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" onClick={handleSave}>
                <BookmarkPlus className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10 px-2" onClick={() => shareTo("whatsapp")} title="Share on WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10 px-2" onClick={() => shareTo("x")} title="Share on X">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10 px-2" onClick={() => shareTo("facebook")} title="Share on Facebook">
                <Facebook className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              className="text-muted-foreground mt-4 hover:text-foreground"
              onClick={() => {
                setIsCracked(false);
                setCurrentFortune(null);
              }}
            >
              Consult the oracle again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons (Hidden when cracked to focus on fortune) */}
      <AnimatePresence>
        {!isCracked && (
          <motion.div 
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-20 mt-16 flex flex-col md:flex-row gap-4 w-full max-w-2xl px-4"
          >
            {store.stats.lastCrackedDate === today ? (
              <Button 
                size="lg" 
                disabled 
                className="flex-1 opacity-60 cursor-not-allowed bg-secondary/20 text-secondary border border-secondary/30 shine-button"
              >
                <MoonStar className="w-5 h-5 mr-2" />
                Next free: {timeUntilMidnight}
              </Button>
            ) : (
              <Button 
                size="lg"
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_20px_rgba(0,212,168,0.3)] transition-all font-semibold shine-button"
                onClick={() => handleCrack("daily")}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Daily Free Fortune
              </Button>
            )}
            
            {!store.subscription.active ? (
              <>
                <Button 
                  size="lg"
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary/10 shadow-[0_0_15px_rgba(212,175,116,0.1)] font-semibold shine-button"
                  onClick={() => {
                    setPaymentIntent("random");
                    setPaymentAmount("0.99");
                    setPaymentModalOpen(true);
                  }}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Crack a Fortune ($1.99)
                </Button>
                
                <Button 
                  size="lg"
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_20px_rgba(199,62,58,0.3)] font-semibold shine-button"
                  onClick={() => {
                    setPaymentIntent("subscription");
                    setPaymentAmount("4.99");
                    setPaymentModalOpen(true);
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Unlimited — $4.99/mo
                </Button>
              </>
            ) : (
              <motion.div 
                className="flex-1 w-full max-w-sm mx-auto"
                animate={{ boxShadow: ['0 0 15px rgba(212,175,116,0.3)', '0 0 35px rgba(212,175,116,0.7)', '0 0 15px rgba(212,175,116,0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ borderRadius: 'var(--radius)' }}
              >
                <Button 
                  size="lg"
                  className="w-full h-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shine-button"
                  onClick={() => handleCrack("random")}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Consult Oracle (Unlimited)
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentModal 
        open={paymentModalOpen} 
        onOpenChange={setPaymentModalOpen} 
        amount={paymentAmount}
        onPaid={onPaymentConfirmed}
      />
      
      <CollectionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        fortunes={store.savedFortunes}
        onRemove={store.removeFortune}
      />

      <div className="z-20 w-full max-w-2xl px-4 mt-8 mb-8">
        <WeeklyFortune
          hasAccess={store.subscription.active || weeklyUnlocked}
          onUnlock={() => {
            setPaymentIntent("random");
            setPaymentAmount("0.99");
            setPaymentModalOpen(true);
          }}
          onUnlockSuccess={() => setWeeklyUnlocked(true)}
        />
      </div>

      {/* BrainAdvisor family footer */}
      <div className="z-20 flex items-center justify-center gap-2 mt-2 pb-8 opacity-80">
        <img src="/brainadvisor-logo.svg" alt="BrainAdvisor" className="w-6 h-6 rounded" />
        <span className="text-xs text-muted-foreground font-mono tracking-wide">
          A BrainAdvisor creation
        </span>
      </div>
    </div>
  );
}
