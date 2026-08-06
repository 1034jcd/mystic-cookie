// Weekly dependency security audit for Mystic Cookie.
// Reads a `pnpm audit --json` dump from AUDIT_JSON (default /tmp/audit.json)
// and emails an alert when high/critical vulnerabilities are found.
// Requires env: SMTP_USER, SMTP_PASS, REPORT_TO. Optional: AUDIT_JSON.
const fs = require('fs');
const nodemailer = require('nodemailer');

const file = process.env.AUDIT_JSON || '/tmp/audit.json';
let audit = {};
try { audit = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (e) { console.log('audit json unreadable:', e.message); }

const meta = (audit.metadata && audit.metadata.vulnerabilities) || {};
const high = (meta.high || 0) + (meta.critical || 0);
console.log('audit: high+critical=' + high, JSON.stringify(meta));

if (high <= 0) { console.log('No high/critical vulnerabilities — all clear.'); process.exit(0); }
if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.REPORT_TO) {
  console.log('No SMTP/report-to — skipping alert email.');
  process.exit(0);
}

const src = audit.advisories || audit.vulnerabilities || {};
const rows = Object.entries(src)
  .filter(([k, v]) => (v.severity === 'high' || v.severity === 'critical'))
  .map(([k, v]) => (v.name || k) + ': ' + (v.severity || '?') + (v.title ? ' — ' + v.title : ''));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'), secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

transporter.sendMail({
  from: process.env.SMTP_USER,
  to: process.env.REPORT_TO,
  subject: 'SECURITY: ' + high + ' high/critical vulns (Mystic Cookie)',
  text: 'High/critical vulnerabilities found:\n' + (rows.join('\n') || 'none listed') + '\n\nFull JSON in GH Actions logs.'
}).then(() => console.log('audit alert sent')).catch((e) => console.error('audit email failed:', e.message));
