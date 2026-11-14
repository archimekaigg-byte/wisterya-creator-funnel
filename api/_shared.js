import { createHash, randomUUID, randomBytes } from 'node:crypto';
import site from '../config/site.config.json' with { type: 'json' };

export { site, randomUUID };
const ephemeralSalt = randomBytes(32).toString('hex');
const minuteCounters = new Map();

export function getIP(req) {
  // Vercel and proxy headers are trusted only when deployed behind the hosting provider.
  return String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim().slice(0, 90);
}
export function ipHash(req) {
  const salt = process.env.EVENT_IP_SALT || ephemeralSalt;
  const ip = getIP(req);
  return ip ? createHash('sha256').update(`${salt}:${ip}`).digest('hex') : null;
}
export function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // Some direct form submissions omit Origin.
  try {
    const parsed = new URL(origin);
    const host = String(req.headers.host || '').toLowerCase();
    return parsed.protocol === 'https:' && parsed.host.toLowerCase() === host || (process.env.NODE_ENV !== 'production' && parsed.protocol === 'http:' && parsed.host.toLowerCase() === host);
  } catch { return false; }
}
export function configuredDestination() {
  const raw = (site.url_tracker || site.url_destinazione || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname || url.hostname === 'example.com') return null;
    return url;
  } catch ¶»§q«^