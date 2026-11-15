import site from '../config/site.config.json' with { type: 'json' };

// Vercel serverless function. Only a valid Cloudflare Turnstile token may redirect.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const fail = (code, message) => res.status(code).setHeader('Content-Type', 'text/plain; charset=utf-8').end(message);
  if (req.method !== 'POST') return fail(405, 'Method not allowed.');
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return fail(503, 'Turnstile secret is not configured on Vercel.');
  const host = String(req.headers.host || '').toLowerCase();
  const origin = req.headers.origin;
  if (origin) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol !== 'https:' || parsed.host.toLowerCase() !== host) return fail(403, 'Invalid origin.');
    } catch { return fail(403, 'Invalid origin.'); }
  }
  let body = req.body;
  if (typeof body === 'string') body = Object.fromEntries(new URLSearchParams(body.slice(0, 4096)));
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(400, 'Invalid form.');
  const { slug, token } = body;
  if (slug !== site.slug || typeof token !== 'string' || !/^[a-zA-Z0-9_.-]{8,2048}$/.test(token)) return fail(400, 'Missing or invalid verification token.');
  let destination;
  try {
    destination = new URL(site.url_destinazione);
    if (destination.protocol !== 'https:' || destination.hostname !== 'www.fanvue.com' || destination.username || destination.password) throw Error('Invalid destination');
  } catch { return fail(503, 'Fanvue destination is not configured.'); }
  let result;
  try {
    const fields = new URLSearchParams({ secret, response: token });
    const remote = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: fields,
      signal: AbortSignal.timeout(8000)
    });
    if (!remote.ok) return fail(503, 'Verification service unavailable.');
    result = await remote.json();
  } catch { return fail(503, 'Verification service unavailable.'); }
  if (result.success !== true) return fail(403, 'Verification unsuccessful. Please go back and retry.');
  const expectedHostname = new URL(site.dominio).hostname.toLowerCase();
  if (String(result.hostname || '').toLowerCase() !== expectedHostname) return fail(403, 'Verification hostname mismatch.');
  res.statusCode = 303;
  res.setHeader('Location', destination.href);
  res.end();
}
