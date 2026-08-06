import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSearch, Link } from "wouter";
import { useFortuneStore } from "@/hooks/useFortuneStore";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/Particles";
import { CheckCircle2, Sparkles } from "lucide-react";

export function PaidPage() {
  const search = useSearch();
  const store = useFortuneStore();
  const activated = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const mode = params.get("mode");
    if (mode === "monthly" && !activated.current) {
      activated.current = true;
      store.setSubscriptionActive(true);
    }
  }, [search, store]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-x-hidden px-4">
      <Particles />
      <motion.div className="z-20 text-center space-y-6 max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-20 h-20 mx-auto rounded-full bg-secondary/10 border border-secondary/40 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-secondary" />
        </div>
        <h1 className="text-gold-shimmer text-4xl md:text-5xl font-serif">Tribute Accepted</h1>
        <p className="text-muted-foreground leading-relaxed">
          The oracle has received your offering. Your fortune is now within reach —
          return to the cookie and let fate speak.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Return to the Cookie
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
