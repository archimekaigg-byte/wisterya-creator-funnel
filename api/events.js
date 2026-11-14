import { originAllowed, recordEvent, sendError } from './_shared.js';
const allowed = new Set(['page_one','page_two','chat_tap','exit_declined']);
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return sendError(res,405,'Method not allowed');
  if (!originAllowed(req)) return sendError(res,403,'Forbidden');
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body.slice(0,2048)) : req.body;
    if (!body || typeof body !== 'object' || !allowed.has(body.event)) return sendError(res,400,'Invalid event');
    let referrer = null;
    try { if(typeof body.referrer === 'string' && body.referrer.length < 1000) {
      const parsed = new URL(body.referrer);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') referrer = parsed.origin;
    }} catch { /* Ignore malformed referrer */ }
    await recordEvent(req,body.event,{referrer});
    res.status(204).end();
  } catch { sendError(res,400,'Invalid event'); }
}
