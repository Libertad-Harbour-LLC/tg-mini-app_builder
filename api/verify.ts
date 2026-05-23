import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyInitData } from './_lib/telegram.js';

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
