import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Infinity as InfinityIcon, CalendarDays, AlertTriangle, Lock, ShieldCheck, HeartHandshake, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: "0.99" | "4.99";
  onPaid: () => void;
}

type CheckoutMode = "single" | "monthly" | "yearly";

export function PaymentModal({ open, onOpenChange, amount }: PaymentModalProps) {
  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = useState<CheckoutMode | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(mode: CheckoutMode) {
    setCheckingOut(mode);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.message || "Checkout failed. Try again.");
    } catch (err: any) {
      setCheckingOut(null);
      setError(err?.message || "The Oracle is busy. Try again in a moment.");
      toast({ title: "The Oracle is busy", description: err?.message || "Try again.", variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-card-border text-card-foreground shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <DialogHeader>
          <div className="mx-auto mb-1 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-b from-primary/30 to-transparent border border-primary/40 shadow-[0_0_24px_rgba(212,175,116,0.35)]">
            <Sparkles className="w-5 h-5 text-primary glow-gold" />
          </div>
          <DialogTitle className="text-2xl font-serif text-gold-shimmer text-center">The Offering</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            The oracle accepts tribute through secure payment. Choose your offering.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {error && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2 text-destructive text-sm"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            </AnimatePresence>
          )}

          <div className="w-full space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="buyer-email" className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Mail className="w-3.5 h-3.5" />
                Your email <span className="text-muted-foreground/60 font-normal">(your fortune is delivered here)</span>
              </label>
              <Input
                id="buyer-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background/60 border-card-border text-card-foreground"
              />
            </div>
            <div className="card-premium rounded-xl p-3" style={amount === "0.99" ? { boxShadow: "0 0 0 1px rgba(212,175,116,0.55), 0 0 30px rgba(212,175,116,0.28)" } : undefined}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  One Fortune
                  {amount === "0.99" && (
                    <Badge className="bg-primary/20 text-primary border-primary/40 text-[9px] tracking-wider">RECOMMENDED</Badge>
                  )}
                </span>
                <span className="text-xl font-serif text-primary">$1.99</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">Unlock this fortune instantly, no account needed.</p>
              <Button
                className="w-full btn-gold font-bold h-12"
                size="lg"
                onClick={() => startCheckout("single")}
                disabled={checkingOut !== null}
              >
                {checkingOut === "single" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Unlock Now
              </Button>
            </div>

            <div className="card-premium rounded-xl p-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">Monthly Unlimited</span>
                <span className="text-xl font-serif text-primary">$4.99<span className="text-xs text-muted-foreground">/mo</span></span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">Crack a new fortune every day. Cancel anytime.</p>
              <Button
                variant="outline"
                className="w-full border-primary/40 text-primary hover:bg-primary/10 font-semibold h-12"
                size="lg"
                onClick={() => startCheckout("monthly")}
                disabled={checkingOut !== null}
              >
                {checkingOut === "monthly" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <InfinityIcon className="w-4 h-4 mr-2" />
                )}
                Go Unlimited
              </Button>
            </div>

            <div className="rounded-xl p-3 border border-secondary/40 bg-gradient-to-b from-secondary/10 to-transparent">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Yearly Unlimited
                  <Badge className="bg-secondary/20 text-secondary border-secondary/40">BEST VALUE</Badge>
                </span>
                <span className="text-xl font-serif text-secondary">$29.99<span className="text-xs text-muted-foreground">/yr</span></span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">Unlimited for a full year — that's 2 months free.</p>
              <Button
                variant="outline"
                className="w-full border-secondary/50 text-secondary hover:bg-secondary/10 font-semibold h-12"
                size="lg"
                onClick={() => startCheckout("yearly")}
                disabled={checkingOut !== null}
              >
                {checkingOut === "yearly" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CalendarDays className="w-4 h-4 mr-2" />
                )}
                Commit to the Year
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Cancel anytime. Secure checkout via Stripe.
            </p>

            <div className="w-full grid grid-cols-3 gap-2 pt-1 border-t border-border/40">
              <div className="text-center">
                <Lock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground leading-tight block">Secure Stripe checkout</span>
              </div>
              <div className="text-center">
                <ShieldCheck className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground leading-tight block">Instant unlock</span>
              </div>
              <div className="text-center">
                <HeartHandshake className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground leading-tight block">Love it or refund</span>
              </div>
            </div>

            <p className="text-center text-[10px] text-muted-foreground/70 leading-relaxed">
              For entertainment purposes only. Lucky numbers are not affiliated with or endorsed by any lottery or gambling operator.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
