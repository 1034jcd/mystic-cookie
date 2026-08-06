import { Router } from "express";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";

const router = Router();

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.headers["x-forwarded-for"]?.toString() || req.ip || "anon",
});

const secretKey = process.env["STRIPE_SECRET_KEY"] ?? "";
const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"] ?? "";
const priceSingle = process.env["STRIPE_PRICE_SINGLE"] ?? "";
const priceMonthly = process.env["STRIPE_PRICE_MONTHLY"] ?? "";
const priceYearly = process.env["STRIPE_PRICE_YEARLY"] ?? "";

const stripe = new Stripe(secretKey);

function getBaseUrl(req: {
  headers: Record<string, string | string[] | undefined>;
}): string {
  const configured =
    process.env["PUBLIC_BASE_URL"] ?? process.env["BASE_URL"] ?? process.env["REPLIT_DOMAINS"];
  if (configured && configured.startsWith("http")) return configured.replace(/\/+$/, "");
  if (configured) return `https://${configured.split(",")[0]?.trim()}`;
  const host = req.headers["host"];
  if (host) return `https://${String(host)}`;
  return "https://mystic-cookie.onrender.com";
}

function log(
  req: { log?: unknown },
  msg: string,
  extra?: Record<string, unknown>,
) {
  const logger = (
    req as {
      log?: { info?: (obj: unknown, m?: string) => void; error?: (obj: unknown, m?: string) => void };
    }
  ).log;
  try {
    logger?.info?.(extra ?? {}, msg);
  } catch {
    // logging is best-effort
  }
}

// ── Create a Stripe Checkout session ──────────────────────────────────────────
router.post("/stripe/checkout", checkoutLimiter, async (req, res) => {
  const { mode, email } = (req.body ?? {}) as { mode?: "single" | "monthly" | "yearly"; email?: string };
  let isSubscription = false;
  let price = priceSingle;
  if (mode === "monthly") {
    isSubscription = true;
    price = priceMonthly;
  } else if (mode === "yearly") {
    isSubscription = true;
    price = priceYearly;
  }

  if (!secretKey) {
    res.status(500).json({ ok: false, message: "Payments are not configured yet." });
    return;
  }
  if (!price) {
    res.status(500).json({ ok: false, message: "No price configured for this option." });
    return;
  }

  const baseUrl = getBaseUrl(req);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${baseUrl}/paid?session_id={CHECKOUT_SESSION_ID}&mode=${mode ?? "single"}`,
      cancel_url: `${baseUrl}/`,
      customer_email: email && email.includes("@") ? email.trim() : undefined,
      metadata: { app: "mystic-cookie", mode: mode ?? "single", email: email ?? "" },
      managed_payments: { enabled: false },
    });
    res.json({ ok: true, url: session.url });
  } catch (err) {
    log(req, "Failed to create Stripe checkout session", { err: String(err) });
    res.status(500).json({ ok: false, message: "Could not start checkout. Try again." });
  }
});

// ── Stripe webhook (payment confirmations) ────────────────────────────────────
router.post("/stripe/webhook", async (req, res) => {
  const signature = req.headers["stripe-signature"] as string | undefined;
  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

  if (!webhookSecret || !signature || !rawBody) {
    res.status(400).json({ error: "Missing webhook signature or body" });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    log(req, "Stripe webhook signature verification failed", { err: String(err) });
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    log(req, "Stripe payment completed", {
      sessionId: session.id,
      mode: session.mode,
      amountTotal: session.amount_total,
      customer: session.customer,
    });
  }

  res.json({ received: true });
});

export default router;
