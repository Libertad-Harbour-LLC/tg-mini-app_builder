export interface VerifyResponse {
  ok: boolean;
  reason?: string;
  user?: { id: number; first_name?: string; username?: string };
  authDate?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Отправляет историю диалога ассистенту. Возвращает текст ответа.
export async function sendChat(messages: ChatMessage[], initData?: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, initData }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `http_${res.status}`);
  }
  const data = (await res.json()) as { reply?: string };
  if (!data.reply) throw new Error('empty_reply');
  return data.reply;
}

// Отправляет initData на сервер для проверки подписи Telegram.
// Возвращает null, если эндпоинт недоступен (например, в локальной разработке).
export async function verifyInitData(initData: string): Promise<VerifyResponse | null> {
  if (!initData) return null;
  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });
    if (!res.ok && res.status !== 401) {
      // 401 — валидный ответ «не прошло»; прочие коды считаем недоступностью.
      if (res.status === 404 || res.status >= 500) return null;
    }
    return (await res.json()) as VerifyResponse;
  } catch {
    return null;
  }
}
