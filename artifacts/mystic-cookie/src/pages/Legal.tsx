import { Link } from "wouter";
import { Particles } from "@/components/Particles";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Scale, Lock, Mail, Sparkles } from "lucide-react";

const sections = [
  {
    icon: <Scale className="w-5 h-5 text-primary" />,
    title: "Entertainment Purposes Only",
    body: [
      "Mystic Cookie and all BrainAdvisor fortune experiences are provided for entertainment, amusement, and inspiration only. The fortunes, predictions, lucky numbers, and guidance shown are generated for fun and are not guarantees, prophecies, or statements of fact.",
      "Nothing on this site is intended to be relied upon as advice of any kind, and you use the service at your own discretion.",
    ],
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    title: "Lucky Numbers & Lottery Disclaimer",
    body: [
      "Any lucky numbers, dates, or suggestions shown by Mystic Cookie are randomly generated for entertainment and are not affiliated with, endorsed by, or connected to any lottery, state or national gaming authority, casino, or gambling operator — including the Texas Lottery or any other lottery.",
      "We do not guarantee any winning numbers, prizes, payouts, or results. Playing any lottery or gambling involves risk of losing money. If you choose to play, please play responsibly and only with money you can afford to lose.",
    ],
  },
  {
    icon: <Scale className="w-5 h-5 text-primary" />,
    title: "Not Professional Advice",
    body: [
      "The content on this site does not constitute financial, legal, medical, tax, investment, or other professional advice. For any decision that could materially affect your health, finances, or legal rights, please consult a qualified professional.",
    ],
  },
  {
    icon: <Lock className="w-5 h-5 text-primary" />,
    title: "Subscriptions, Payments & Refunds",
    body: [
      "Payments are processed securely by Stripe. Single unlocks are one-time purchases. Monthly and yearly plans are subscriptions that renew automatically until cancelled.",
      "You can cancel a subscription anytime from your Stripe payment email receipt (\"Manage subscription\"), and you will not be charged again after the current period ends.",
      "If you are not happy with your purchase, contact us within 14 days of purchase and we will issue a refund — no hard feelings.",
    ],
  },
  {
    icon: <Lock className="w-5 h-5 text-primary" />,
    title: "Privacy",
    body: [
      "We only use your email address to deliver what you purchased (such as your fortune) and to send receipts. We never sell, rent, or share your personal information with third parties for marketing.",
      "We do not collect payment card details — those are handled entirely by Stripe, our payment processor.",
    ],
  },
  {
    icon: <Mail className="w-5 h-5 text-primary" />,
    title: "Contact",
    body: [
      "Questions, refunds, or feedback? We read everything: 1034jcd@gmail.com.",
      "Mystic Cookie is part of the BrainAdvisor family of apps.",
    ],
  },
];

export function LegalPage() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center relative overflow-x-hidden px-4 py-10">
      <Particles />
      <div className="z-20 w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-gold-shimmer text-4xl md:text-5xl font-serif">Legal &amp; Disclaimers</h1>
          <p className="text-muted-foreground">
            Important information for using Mystic Cookie. Please read before purchasing.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.title} className="bg-card/60 border border-card-border rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                {s.icon}
                <h2 className="font-serif text-lg text-card-foreground">{s.title}</h2>
              </div>
              {s.body.map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link href="/">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Back to the Cookie
            </Button>
          </Link>
        </div>
        <p className="text-center text-xs text-muted-foreground opacity-70">
          For entertainment purposes only. Not affiliated with any lottery or gambling operator.
        </p>
      </div>
    </div>
  );
}
