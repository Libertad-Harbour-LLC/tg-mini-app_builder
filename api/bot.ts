import type { VercelRequest, VercelResponse } from '@vercel/node';
import { askGroq } from './_lib/assistant';
import { sendMessage, sendChatAction } from './_lib/telegram';

const WELCOME =
  'Здравствуйте! Я — ИИ-ассистент автошколы «ТЕСЛА». ' +
  'Задайте вопрос о категориях, тарифах, сроках обучения или филиалах — я отвечу. ' +
  'Чтобы записаться, откройте приложение кнопкой «Открыть автошколу» или позвоните: +7 (939) 505 02-10.';

interface TgUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { is_bot?: boolean };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(200).json({ ok: true });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    res.status(200).json({ ok: true });
    return;
  }

  // Защита вебхука: Telegram присылает заданный секрет в заголовке.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    res.status(401).json({ ok: false });
    return;
  }

  const update = (req.body ?? {}) as TgUpdate;
  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();

  // Всегда отвечаем Telegram 200 быстро; ошибки логируем, но не роняем вебхук.
  if (!chatId || !text || message?.from?.is_bot) {
    res.status(200).json({ ok: true });
    return;
  }

  try {
    if (text === '/start' || text === '/help') {
      await sendMessage(token, chatId, WELCOME);
      res.status(200).json({ ok: true });
      return;
    }

    const question = text.startsWith('/ask') ? text.slice(4).trim() : text;
    if (!question) {
      await sendMessage(token, chatId, 'Пожалуйста, напишите ваш вопрос.');
      res.status(200).json({ ok: true });
      return;
    }

    await sendChatAction(token, chatId, 'typing');
    const reply = await askGroq([{ role: 'user', content: question }]);
    await sendMessage(token, chatId, reply);
  } catch {
    await sendMessage(
      token,
      chatId,
      'Извините, сейчас не удаётся обработать запрос. Позвоните нам: +7 (939) 505 02-10.',
    ).catch(() => undefined);
  }

  res.status(200).json({ ok: true });
}
