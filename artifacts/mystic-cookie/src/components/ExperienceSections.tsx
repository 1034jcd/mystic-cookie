import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Gift, Infinity as InfinityIcon, ScrollText, Lock, ShieldCheck, HeartHandshake, Landmark } from "lucide-react";
import { motion } from "framer-motion";

const EXPERIENCE = [
  {
    icon: Gift,
    title: "Daily Free Fortune",
    desc: "One complimentary fortune every day at midnight — no card, no account, no catch.",
    accent: "text-primary",
  },
  {
    icon: InfinityIcon,
    title: "Oracle Unlimited",
    desc: "$4.99/mo or $29.99/yr. Crack as many fortunes as you wish and keep every omen.",
    accent: "text-secondary",
  },
  {
    icon: ScrollText,
    title: "Scroll of Memories",
    desc: "Favorites live in your private collection — share them on WhatsApp, X, or Facebook.",
    accent: "text-primary",
  },
];

const TRUST = [
  { icon: Lock, label: "Secure Stripe checkout" },
  { icon: ShieldCheck, label: "Instant unlock" },
  { icon: HeartHandshake, label: "Love it or refund · 14 days" },
  { icon: Landmark, label: "Not a lottery or gambling site" },
];

const FAQS = [
  {
    q: "Is Mystic Cookie free to use?",
    a: "Yes — one complimentary fortune every day at midnight. Paid unlocks and the optional Oracle Unlimited membership are extras for those who want more.",
  },
  {
    q: "How does Oracle Unlimited work?",
    a: "Unlimited is $4.99/month or $29.99/year. Once active, you can crack as many fortunes as you like and save them all to your collection. Cancel anytime.",
  },
  {
    q: "What are the lucky numbers for?",
    a: "Entertainment only. Lucky numbers are generated for fun and are not affiliated with or endorsed by any lottery, lottery retailer, or gambling operator.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes. If you're not delighted, email 1034jcd@gmail.com within 14 days of purchase for a full refund — no questions asked.",
  },
  {
    q: "Who is behind Mystic Cookie?",
    a: "Mystic Cookie is crafted by the BrainAdvisor family — a set of practical AI-powered apps from one founder. Explore the rest of the family in the bar below.",
  },
];

export function ExperienceSections() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="z-20 w-full max-w-2xl px-4 mt-14"
    >
      <div className="eyebrow-luxe mb-4 flex items-center justify-center gap-3">
        <span className="w-8 h-px bg-gradient-to-r from-transparent to-primary/60" />
        The Experience
        <span className="w-8 h-px bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EXPERIENCE.map((item) => (
          <div key={item.title} className="card-premium rounded-2xl p-5 text-center flex flex-col items-center gap-3">
            <span className={`${item.accent} glow-gold`}>
              <item.icon className="w-6 h-6" />
            </span>
            <h3 className="text-sm font-serif uppercase tracking-[0.2em] text-primary">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TRUST.map((item) => (
          <div key={item.label} className="glass-panel rounded-xl px-3 py-3 text-center">
            <item.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1.5" />
            <span className="text-[10px] text-muted-foreground leading-tight block">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <div className="eyebrow-luxe mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-gradient-to-r from-transparent to-primary/60" />
          Questions for the Oracle
          <span className="w-8 h-px bg-gradient-to-l from-transparent to-primary/60" />
        </div>
        <div className="card-premium rounded-2xl px-5 py-2">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-card-foreground hover:text-primary font-serif">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="flex justify-center mt-4">
          <Badge variant="outline" className="text-[10px] tracking-wider text-muted-foreground border-border">
            For entertainment purposes only
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
