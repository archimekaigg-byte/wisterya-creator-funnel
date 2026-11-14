import { originAllowed, configuredDestination, getIP, rateLimit, recordEvent, randomUUID, sendError, site } from './_shared.js';

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return sendError(res,405,'Method not allowed');
  if (!originAllowed(req)) return sendError(res,403,'Invalid origin');
  const destination = configuredDestination();
  if (!destination) return sendError(res,503,'Destination not configured by the site owner.');
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || /^[123]x0{31}AA$/.test(secret) && process.env.NODE_ENV === 'production') {
    return sendError(res,503,'Turnstile is not configured for production.');
  }
  try { if (!await rateLimit(req)) return sendError(res,429,'Too many attempts. Please retry in one minute.'); }
  catch { return sendError(res,503,'Verification temporarily unavailable.'); }
  const body = typeof req.body === 'string' ? Object.fromEntries(new URLSearchParams(req.body.slice(0,4000))) : req.body || {};
  if (body.slug !== site.slug || typeof body.token !== 'string' || !/^[\w.-]{8,2048}$/.test(body.token)) return sendError(res,400,'Missing or invalid verification token.');
  let verification;
  try {
    const fields = new URLSearchParams({secret,response:body.token});
    const ip=getIP(req);
    if (ip) fields.set('remoteip',ip);
    const remote = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'¶»§q«^