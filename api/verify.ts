import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_AGE_SECONDS = 24 * 60 * 60; // initData считается валидной сутки

interface VerifyResult {
  ok: boolean;
  reason?: string;
  user?: unknown;
  authDate?: number;
}

function verifyInitData(initData: string, botToken: string): VerifyResult {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'no_hash' };
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // Сравнение с защитой от timing-атак.
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'bad_hash' };
  }

  const authDate = Number(params.get('auth_date'));
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SECONDS) {
    return { ok: false, reason: 'expired' };
  }

  const userRaw = params.get('user');
  let user: unknown = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      // оставляем user = null
    }
  }

  return { ok: true, user, authDate };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, reason: 'method_not_allowed' });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    res.status(500).json({ ok: false, reason: 'server_misconfigured' });
    return;
  }

  const body = (req.body ?? {}) as { initData?: string };
  const initData = typeof body.initData === 'string' ? body.initData : '';
  if (!initData) {
    res.status(400).json({ ok: false, reason: 'no_init_data' });
    return;
  }

  const result = verifyInitData(initData, botToken);
  res.status(result.ok ? 200 : 401).json(result);
}
