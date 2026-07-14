// Vercel Serverless Function: Kontaktformular
// 1. Prüft den Cloudflare-Turnstile-Token (Bot-Schutz)
// 2. Leitet die Anfrage per E-Mail weiter (Resend)
//
// Benötigte Environment-Variablen (in Vercel setzen):
//   TURNSTILE_SECRET_KEY  – Secret Key aus dem Cloudflare-Dashboard
//   RESEND_API_KEY        – API-Key von resend.com (kostenloser Plan reicht)
//   CONTACT_EMAIL         – Empfängeradresse für Anfragen

export const config = { api: { bodyParser: false } };

async function parseFormData(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(buffer.toString()));
  }
  // multipart/form-data (FormData vom Browser)
  const boundary = contentType.split('boundary=')[1];
  const fields = {};
  if (!boundary) return fields;
  for (const part of buffer.toString().split(`--${boundary}`)) {
    const match = part.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/);
    if (match) fields[match[1]] = match[2].trim();
  }
  return fields;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fields = await parseFormData(req);
  const token = fields['cf-turnstile-response'];

  // 1. Turnstile-Verifizierung
  if (!token) {
    return res.status(400).json({ error: 'Bot-Schutz nicht bestätigt' });
  }
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: req.headers['x-forwarded-for']?.split(',')[0] || '',
    }),
  });
  const outcome = await verify.json();
  if (!outcome.success) {
    return res.status(403).json({ error: 'Bot-Schutz fehlgeschlagen' });
  }

  // 2. E-Mail versenden
  const { bad = '', name = '', kontaktdaten = '', nachricht = '' } = fields;
  if (!bad || !name || !kontaktdaten) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }

  const mail = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Landingpage <onboarding@resend.dev>', // nach Domain-Verifizierung eigene Adresse
      to: process.env.CONTACT_EMAIL,
      subject: `Neue Anfrage: ${bad}`,
      text: `Bad/Einrichtung: ${bad}\nName: ${name}\nKontakt: ${kontaktdaten}\n\nNachricht:\n${nachricht || '–'}`,
    }),
  });

  if (!mail.ok) {
    return res.status(502).json({ error: 'E-Mail-Versand fehlgeschlagen' });
  }
  return res.status(200).json({ ok: true });
}
