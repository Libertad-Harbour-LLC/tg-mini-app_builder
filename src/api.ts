export interface VerifyResponse {
  ok: boolean;
  reason?: string;
  user?: { id: number; first_name?: string; username?: string };
  authDate?: number;
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
