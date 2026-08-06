import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Infinity as InfinityIcon, CalendarDays, AlertTriangle } from "lucide-react";
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

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = useState<CheckoutMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(mode: CheckoutMode) {
    setCheckingOut(mode);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
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
          <DialogTitle className="text-2xl font-serif text-primary text-center">Offering Required</DialogTitle>
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
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-14"
              size="lg"
              onClick={() => startCheckout("single")}
              disabled={checkingOut !== null}
            >
              {checkingOut === "single" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Unlock This Fortune — $1.99
            </Button>

            <Button
              variant="outline"
              className="w-full border-primary/40 text-primary hover:bg-primary/10 font-semibold h-14"
              size="lg"
              onClick={() => startCheckout("monthly")}
              disabled={checkingOut !== null}
            >
              {checkingOut === "monthly" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <InfinityIcon className="w-4 h-4 mr-2" />
              )}
              Monthly Unlimited — $4.99/mo
            </Button>

            <Button
              variant="outline"
              className="w-full border-secondary/50 text-secondary hover:bg-secondary/10 font-semibold h-14"
              size="lg"
              onClick={() => startCheckout("yearly")}
              disabled={checkingOut !== null}
            >
              {checkingOut === "yearly" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CalendarDays className="w-4 h-4 mr-2" />
              )}
              Yearly Unlimited — $29.99/yr
              <Badge className="ml-2 bg-secondary/20 text-secondary border-secondary/40">BEST VALUE</Badge>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Cancel anytime. Secure checkout via Stripe.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
