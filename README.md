# Автошкола Тесла — Telegram Mini App

Мини-приложение для автошколы: категории и цены, расписание наборов,
запись на обучение и контакты. React + Vite + TypeScript, оформлено под
нативную тему Telegram (светлая/тёмная), mobile-first. Соцсети — векторными
иконками (Telegram, WhatsApp, ВКонтакте, MAX).

## Запуск локально

```bash
npm install
npm run dev      # дев-сервер на http://localhost:5173
npm run build    # прод-сборка в dist/
npm run preview  # предпросмотр сборки
```

## Что отредактировать

Весь контент — в `src/data.ts`:

- `SCHOOL` — название, телефон, ссылка на сайт, мессенджеры и соцсети
  (Telegram, WhatsApp, ВК, MAX);
- `CATEGORIES` — категории B/A/C с тарифами, ценами и доп. услугами;
- `SCHEDULE` — ближайшие наборы;
- `PROMOS` — акции.

## Деплой на Vercel

Проект готов к деплою на Vercel: фронтенд (Vite) + serverless-функции:
`api/verify.ts` (проверка подписи `initData`), `api/chat.ts` (ИИ-ассистент в
мини-аппе) и `api/bot.ts` (вебхук бота с ИИ-ответами). Конфиг — `vercel.json`.

1. Запушьте репозиторий на GitHub.
2. На [vercel.com](https://vercel.com) → **Add New… → Project** → импортируйте репозиторий.
3. Vercel сам определит фреймворк (Vite). Настройки по умолчанию подходят:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Добавьте переменные окружения (см. ниже) и нажмите **Deploy**.
5. Через CLI альтернативно: `npm i -g vercel && vercel` (затем `vercel --prod`).

### Переменные окружения в Vercel

Project → **Settings → Environment Variables**. Добавьте для окружений
**Production** (и при желании Preview/Development):

| Имя | Обяз. | Значение | Назначение |
|-----|-------|----------|------------|
| `TELEGRAM_BOT_TOKEN` | да | токен бота из @BotFather (`123456789:AA…`) | Проверка `initData` в `/api/verify` и ответы бота в `/api/bot`. |
| `GROQ_API_KEY` | да (для ИИ) | ключ из [console.groq.com/keys](https://console.groq.com/keys) (`gsk_…`) | Вызов модели Groq для ассистента (`/api/chat`, `/api/bot`). |
| `GROQ_MODEL` | нет | напр. `llama-3.3-70b-versatile` | Переопределение модели Groq (по умолчанию `llama-3.3-70b-versatile`). |
| `TELEGRAM_WEBHOOK_SECRET` | нет | случайная строка | Защита вебхука бота: сверяется со `secret_token` из `setWebhook`. |

Все значения — **секреты**, хранить только в Vercel. Шаблон — в `.env.example`.
После добавления/изменения переменных сделайте **Redeploy**, чтобы они
применились. Префикс `VITE_` не нужен: значения используются только на сервере
и не попадают в клиентский бандл.

### ИИ-ассистент (Groq)

- Системный промпт и база знаний — в `api/_lib/assistant.ts`.
- **Мини-апп**: вкладка «Ассистент» шлёт диалог на `POST /api/chat`
  (`src/api.ts` → `sendChat`), сервер добавляет системный промпт, вызывает Groq
  и возвращает ответ. Если передан `initData`, его подпись проверяется.
- **Бот**: каждое текстовое сообщение (кроме `/start`, `/help`) уходит в Groq и
  возвращается ответом. Чтобы это работало, задайте вебхук (см. ниже).

### Проверка initData

- Клиент при загрузке шлёт `initData` на `POST /api/verify`
  (`src/api.ts` → `verifyInitData`).
- Сервер (`api/verify.ts`) считает HMAC-SHA256 по секрету
  `HMAC_SHA256(bot_token, "WebAppData")`, сверяет с `hash` (timing-safe),
  проверяет свежесть `auth_date` (≤ 24 ч) и возвращает `{ ok, user }`.
- Доверяйте данным пользователя только после `ok: true`. Клиентский
  `initDataUnsafe` — лишь для отображения.

## Подключение к боту (BotFather)

После деплоя у вас будет HTTPS-URL вида `https://<project>.vercel.app`.
В диалоге с [@BotFather](https://t.me/BotFather):

1. **Main Mini App** (кнопка запуска приложения у бота):
   `/mybots` → выберите бота → **Bot Settings → Configure Mini App →
   Enable Mini App** → укажите URL:
   ```
   https://<project>.vercel.app/
   ```
   Можно задать тот же URL и короткими командами `/myapps` / `/newapp`.

2. **Menu Button** (кнопка меню слева от поля ввода):
   `/mybots` → бот → **Bot Settings → Menu Button → Configure menu button**
   → введите тот же URL и текст кнопки (например, «Открыть автошколу»):
   ```
   https://<project>.vercel.app/
   ```

> Используйте **корневой** URL (со слешем на конце) — на нём отдаётся
> приложение. Свой кастомный домен в Vercel (Settings → Domains) тоже
> подойдёт: тогда указывайте его вместо `*.vercel.app`.

### Вебхук бота (ИИ-ответы в чате)

Чтобы бот отвечал на вопросы через ИИ, направьте его обновления на
`/api/bot`. Один раз выполните запрос (подставьте токен и, при наличии,
секрет из `TELEGRAM_WEBHOOK_SECRET`):

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<project>.vercel.app/api/bot&secret_token=<SECRET>"
```

Проверить: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`.
Снять вебхук: `.../deleteWebhook`. После этого любое текстовое сообщение боту
(кроме `/start` и `/help`) обрабатывается ассистентом. Бот не хранит историю
между сообщениями (stateless) — каждый вопрос отвечается независимо.

### Отправка заявок

Форма записи (`src/components/EnrollForm.tsx`) отправляет заявку через
`Telegram.WebApp.sendData(...)` — данные приходят боту, если Mini App открыт
через **reply-keyboard кнопку** `web_app`. Если `sendData` недоступен
(Main Mini App / Menu Button / inline-кнопка / открытие вне Telegram), заявка
уходит менеджеру в **WhatsApp** с заполненным текстом. При необходимости
добавьте отправку на свой backend в помеченном месте кода.
