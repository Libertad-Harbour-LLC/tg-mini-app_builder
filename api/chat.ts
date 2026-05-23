import type { VercelRequest, VercelResponse } from '@vercel/node';
import { askGroq, type ChatMessage } from './_lib/assistant.js';
import { verifyInitData } from './_lib/telegram.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = (req.body ?? {}) as { messages?: ChatMessage[]; initData?: string };

  // Если передан initData — проверяем подпись и отклоняем подделку.
  // Отсутствие initData допускается (локальная разработка / открытие вне Telegram).
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken && typeof body.initData === 'string' && body.initData.length > 0) {
    const v = verifyInitData(body.initData, botToken);
    if (!v.ok) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    res.status(400).json({ error: 'no_messages' });
    return;
  }

  try {
    const reply = await askGroq(messages);
    res.status(200).json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    const status = msg === 'missing_groq_key' ? 500 : 502;
    res.status(status).json({ error: 'assistant_unavailable', detail: msg });
  }
}
