import { Link } from "wouter";

const LINKS = [
  { label: "BrainAdvisor AI", href: "https://brainadvisor.onrender.com", external: true },
  { label: "BrainAPI", href: "https://brainapi-1bcu.onrender.com", external: true },
  { label: "BrainB2B", href: "https://brainb2b.onrender.com", external: true },
  { label: "BrainDocs", href: "https://braindocs-7qqx.onrender.com", external: true },
];

export function FamilyStrip() {
  return (
    <div className="relative z-20 flex flex-col items-center justify-center gap-2 px-4 py-6 border-t border-border/40 text-center">
      <span className="text-[10px] text-muted-foreground font-mono tracking-[0.25em] uppercase">
        🧠 The BrainAdvisor Family
      </span>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary/80 hover:text-primary underline underline-offset-2"
          >
            {link.label}
          </a>
        ))}
        <Link href="/" className="text-xs text-primary/80 hover:text-primary underline underline-offset-2">
          Mystic Cookie
        </Link>
      </nav>
      <p className="text-[10px] text-muted-foreground/60">
        One account. One AI brain. Five ways to get answers.
      </p>
    </div>
  );
}
