import crypto from 'node:crypto';

export interface VerifyResult {
  ok: boolean;
  reason?: string;
  user?: unknown;
  authDate?: number;
}

const MAX_AGE_SECONDS = 24 * 60 * 60;

export function verifyInitData(initData: string, botToken: string): VerifyResult {
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

const API = 'https://api.telegram.org';

export async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  extra: Record<string, unknown> = {},
): Promise<void> {
  await fetch(`${API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
}

export async function sendChatAction(token: string, chatId: number, action = 'typing'): Promise<void> {
  await fetch(`${API}/bot${token}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}
