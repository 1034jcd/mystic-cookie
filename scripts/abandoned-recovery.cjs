// Abandoned-checkout recovery for Mystic Cookie.
// Finds open Stripe checkout sessions with an email that were created a few hours
// ago (but not yet expired), and sends ONE gentle reminder with the checkout link.
// Requires env: STRIPE_SECRET_KEY, SMTP_USER, SMTP_PASS. Optional: ADMIN_EMAIL,
// EXCLUDE_EMAILS (comma-separated), MIN_AGE_H, MAX_AGE_H.
const https = require('https');
const nodemailer = require('nodemailer');

const SK = process.env.STRIPE_SECRET_KEY || '';
const EXCLUDE = new Set(
  ((process.env.EXCLUDE_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean))
);
const MIN_AGE_H = parseFloat(process.env.MIN_AGE_H || '2');
const MAX_AGE_H = parseFloat(process.env.MAX_AGE_H || '23');

function stripe(path) {
  return new Promise((resolve) => {
    https.get('https://api.stripe.com/v1/' + path, {
      headers: { Authorization: 'Basic ' + Buffer.from(SK + ':').toString('base64') }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({ error: { message: 'parse failed' } }); } });
    }).on('error', e => resolve({ error: { message: e.message } }));
  });
}

(async () => {
  if (!SK) { console.log('No STRIPE_SECRET_KEY — skipping abandoned recovery.'); process.exit(0); }

  const now = Math.floor(Date.now() / 1000);
  const gte = now - MAX_AGE_H * 3600;
  const lte = now - MIN_AGE_H * 3600;
  const q = `checkout/sessions?status=open&limit=100&created[gte]=${gte}&created[lte]=${lte}`;
  const data = await stripe(q);
  if (data.error) { console.error('Stripe error:', data.error.message); process.exit(1); }

  const sessions = (data.data || []).filter(s => {
    const email = (s.customer_email || '').toLowerCase();
    return email && !EXCLUDE.has(email);
  });

  console.log(`Eligible abandoned checkouts: ${sessions.length} (window ${MIN_AGE_H}h-${MAX_AGE_H}h)`);
  for (const s of sessions) console.log('  candidate:', s.id, s.customer_email, '$' + ((s.amount_total || 0) / 100));

  if (!sessions.length) { console.log('Nothing to do.'); process.exit(0); }
  if (!process.env.SMTP_PASS || !process.env.SMTP_USER) { console.log('No SMTP configured — skipping emails.'); process.exit(0); }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'), secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  let sent = 0;
  for (const s of sessions) {
    const url = s.url || '';
    if (!url) { console.log('  skip (no url):', s.id); continue; }
    try {
      await transporter.sendMail({
        from: `"Mystic Cookie" <${process.env.SMTP_USER}>`,
        to: s.customer_email,
        subject: '🍪 Your fortune is waiting — Mystic Cookie',
        html: `
          <div style="font-family:Georgia,serif;background:#0a1a0a;color:#d4af74;padding:24px;border-radius:8px;">
            <h2 style="color:#00d4a8;">🍪 Your fortune is still waiting</h2>
            <p style="color:#e0e0e0;">Hi! You started to unlock a fortune with Mystic Cookie but didn't finish checkout. No pressure — whenever you're ready, your fortune is waiting right here:</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${url}" style="background:#00d4a8;color:#0a1a0a;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Finish &amp; Unlock My Fortune</a>
            </p>
            <p style="color:#999;font-size:12px;">Questions or changed your mind? Just reply to this email — we're happy to help. Unhappy with your purchase? We offer a 14-day, no-hard-feelings refund.</p>
            <p style="color:#666;font-size:11px;">For entertainment purposes only. Not affiliated with any lottery or gambling operator.</p>
          </div>`
      });
      sent++;
      console.log('  emailed:', s.customer_email);
    } catch (e) {
      console.error('  SMTP warning (not sent):', s.customer_email, e.message);
    }
  }
  console.log(`Done. Reminders sent: ${sent}/${sessions.length}`);
})().catch(e => { console.error(e); process.exit(1); });
