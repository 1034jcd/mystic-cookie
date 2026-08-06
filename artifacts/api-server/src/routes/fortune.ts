import { Router } from "express";
import { randomUUID } from "crypto";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import { GetRandomFortuneQueryParams, GetChimeQrCodeQueryParams } from "@workspace/api-zod";
import fortuneData from "../data/fortunes.json" with { type: "json" };

const router = Router();

type FortuneEntry = {
  id: number;
  text: string;
  category: string;
  luckyNumbers: number[];
};

type CategoryEntry = {
  name: string;
  emoji: string;
};

const fortunes = fortuneData.fortunes as FortuneEntry[];
const categories = fortuneData.categories as CategoryEntry[];

// ── Token store ────────────────────────────────────────────────────────────────
type TokenRecord = {
  status: "pending" | "approved" | "expired";
  amount: string;
  ip: string;
  createdAt: number;
};

const tokenStore = new Map<string, TokenRecord>();
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Prune expired tokens every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, record] of tokenStore) {
    if (now - record.createdAt > TOKEN_TTL_MS) {
      tokenStore.delete(token);
    }
  }
}, 30 * 60 * 1000);

// ── Helpers ────────────────────────────────────────────────────────────────────
function getLuckyNumbers(): number[] {
  const nums = new Set<number>();
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 66) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

function createTransporter() {
  const user = process.env["GMAIL_USER"];
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function getBaseUrl(req: { headers: Record<string, string | string[] | undefined> }): string {
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) {
    const first = domains.split(",")[0]?.trim();
    if (first) return `https://${first}`;
  }
  const host = req.headers["host"];
  if (host) return `https://${host}`;
  return "https://mystic-cookie.replit.app";
}

// ── Fortune routes ─────────────────────────────────────────────────────────────
router.get("/fortune/random", (req, res) => {
  const parseResult = GetRandomFortuneQueryParams.safeParse(req.query);
  const category = parseResult.success ? parseResult.data.category : undefined;

  let pool = fortunes;
  if (category) {
    pool = pool.filter((f) => f.category === category);
  }
  if (pool.length === 0) {
    res.status(404).json({ error: "No fortunes found for that category" });
    return;
  }

  const fortune = pool[Math.floor(Math.random() * pool.length)];
  res.json({
    ...fortune,
    luckyNumbers: getLuckyNumbers(),
    date: new Date().toISOString().split("T")[0],
  });
});

router.get("/fortune/weekly", (_req, res) => {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / 86400000);
  const weekSeed = Math.floor(daysSinceEpoch / 7);
  const fortune = fortunes[weekSeed % fortunes.length];

  const jan4 = new Date(now.getFullYear(), 0, 4);
  const weekNumber = Math.ceil(
    ((now.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7
  );

  const nextMonday = new Date(now);
  const daysUntilMonday = ((8 - now.getUTCDay()) % 7) || 7;
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);

  res.json({
    id: fortune.id,
    text: fortune.text,
    category: fortune.category,
    luckyNumbers: [4, 8, 15, 16, 23, 42].slice(0, 5),
    weekNumber,
    weekLabel: `Week ${weekNumber} of ${now.getFullYear()}`,
    expiresAt: nextMonday.toISOString(),
  });
});

router.get("/fortune/daily", (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const seed =
    today
      .split("-")
      .map(Number)
      .reduce((a, b) => a + b, 0) % fortunes.length;
  const fortune = fortunes[seed];
  res.json({
    ...fortune,
    luckyNumbers: [3, 7, 14, 21, 42],
    date: today,
  });
});

router.get("/fortune/categories", (_req, res) => {
  const counts = categories.map((cat) => ({
    name: cat.name,
    emoji: cat.emoji,
    count: fortunes.filter((f) => f.category === cat.name).length,
  }));
  res.json(counts);
});

// ── Check token status (polled by frontend) ────────────────────────────────────
router.get("/fortune/check-token", (req, res) => {
  const token = req.query["token"] as string | undefined;
  if (!token) {
    res.status(400).json({ status: "invalid" });
    return;
  }
  const record = tokenStore.get(token);
  if (!record) {
    res.json({ status: "invalid" });
    return;
  }
  if (Date.now() - record.createdAt > TOKEN_TTL_MS) {
    tokenStore.delete(token);
    res.json({ status: "expired" });
    return;
  }
  res.json({ status: record.status });
});

// ── Admin approve endpoint (owner clicks link in email) ────────────────────────
router.get("/admin/approve/:token", (req, res) => {
  const adminSecret = process.env["SESSION_SECRET"];
  const { token } = req.params;
  const { secret } = req.query as { secret?: string };

  if (!adminSecret || secret !== adminSecret) {
    res.status(403).send(`
      <html><body style="font-family:serif;background:#0a0a0f;color:#c73e3a;padding:40px;text-align:center;">
        <h2>❌ Access Denied</h2><p>Invalid or missing secret.</p>
      </body></html>
    `);
    return;
  }

  const record = tokenStore.get(token);
  if (!record) {
    res.send(`
      <html><body style="font-family:serif;background:#0a0a0f;color:#d4af74;padding:40px;text-align:center;">
        <h2>⚠️ Token not found</h2><p>It may have expired or already been approved.</p>
      </body></html>
    `);
    return;
  }

  record.status = "approved";
  tokenStore.set(token, record);

  res.send(`
    <html><body style="font-family:Georgia,serif;background:#0a1a0a;color:#00d4a8;padding:40px;text-align:center;">
      <h2>✅ Payment Approved</h2>
      <p style="color:#d4af74;">Token approved for $${record.amount}. The user's fortune is now unlocking automatically.</p>
      <p style="color:#666;font-size:12px;">Token: ${token}</p>
    </body></html>
  `);
});

// ── Verify payment (submit claim — creates pending token) ──────────────────────
const verifyPaymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers["x-forwarded-for"]?.toString() || req.ip || "anon",
  handler: (_req, res) => {
    res.status(429).json({ ok: false, message: "Too many attempts. Wait 15 minutes and try again." });
  },
});

router.post("/fortune/verify-payment", verifyPaymentLimiter, async (req, res) => {
  const { amount, method, mathAnswer, mathChallenge } = req.body as {
    amount?: string;
    method?: string;
    note?: string;
    mathAnswer?: number;
    mathChallenge?: { a?: number; b?: number; text?: string };
  };

  if (!amount || !method) {
    res.status(400).json({ ok: false, message: "amount and method are required" });
    return;
  }

  // Math check
  const expectedAnswer = (mathChallenge?.a ?? 0) + (mathChallenge?.b ?? 0);
  const mathCorrect = Number.isFinite(mathAnswer) && mathAnswer === expectedAnswer;

  if (!mathCorrect) {
    res.status(400).json({ ok: false, message: "Incorrect answer. Please try again." });
    return;
  }

  // Math passed — auto-verified. Send owner a notification email (no approval needed).
  const ip = req.headers["x-forwarded-for"]?.toString() || req.ip || "unknown";
  const ownerEmail = process.env["OWNER_EMAIL"] ?? "1034jcd@gmail.com";
  const chimeTag = process.env["CHIME_SIGNUP"] ?? "$jduvall";
  const now = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Mystic Cookie" <${process.env["GMAIL_USER"]}>`,
        to: ownerEmail,
        subject: `🍪 Mystic Cookie — Verified Payment $${amount}`,
        html: `
          <div style="font-family:Georgia,serif;background:#0a1a0a;color:#d4af74;padding:24px;border-radius:8px;">
            <h2 style="color:#00d4a8;">🍪 Mystic Cookie — Payment Verified</h2>
            <p style="color:#e0e0e0;">A fortune was unlocked after passing verification for <strong style="color:#00d4a8;">$${amount}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;color:#e0e0e0;margin:16px 0;">
              <tr><td style="padding:8px 0;"><strong>Amount:</strong></td><td>$${amount}</td></tr>
              <tr><td style="padding:8px 0;"><strong>Chime tag:</strong></td><td>${chimeTag}</td></tr>
              <tr><td style="padding:8px 0;"><strong>Math check:</strong></td><td style="color:#00d4a8;">✅ PASSED (${mathChallenge?.text ?? "N/A"} = ${mathAnswer})</td></tr>
              <tr><td style="padding:8px 0;"><strong>Time (CT):</strong></td><td>${now}</td></tr>
              <tr><td style="padding:8px 0;"><strong>IP:</strong></td><td>${ip}</td></tr>
            </table>
            <p style="color:#999;font-size:12px;">This is a notification only — no action required. Check your Chime app to confirm receipt.</p>
          </div>
        `,
      });
    } catch (err) {
      req.log.error({ err }, "Failed to send notification email");
    }
  }

  res.json({ ok: true, message: "Verified — Fortune unlocked" });
});

// ── QR code ────────────────────────────────────────────────────────────────────
router.get("/fortune/qrcode", async (req, res) => {
  const parseResult = GetChimeQrCodeQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid amount. Must be 0.99 or 4.99" });
    return;
  }

  const { amount } = parseResult.data;
  const chimeTag = process.env["CHIME_SIGNUP"] ?? process.env["CHIME_TAG"] ?? "$jduvall";
  const note = amount === "0.99" ? "Mystic Fortune" : "Mystic Cookie - Monthly Unlimited";
  const chimeUrl = `https://chime.me/r/${chimeTag}?amount=${amount}`;

  const a = Math.floor(Math.random() * 50);
  const b = Math.floor(Math.random() * 50);
  const mathChallenge = { a, b, text: `${a} + ${b} = ?` };

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(chimeUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#d4af74", light: "#0a0a0f" },
    });

    res.json({
      qrCodeDataUrl,
      chimeTag,
      amount,
      instructions: `Open Chime app → Tap "Pay Anyone" → Search ${chimeTag} → Send $${amount} → Note: "${note}" → Return here and tap "I've Paid!"`,
      mathChallenge,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate QR code");
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

export default router;
