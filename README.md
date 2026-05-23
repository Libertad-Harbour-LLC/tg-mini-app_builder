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

Проект готов к деплою на Vercel: фронтенд (Vite) + serverless-функция
`api/verify.ts` для проверки подписи Telegram `initData`. Конфиг — `vercel.json`.

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

| Имя | Значение | Назначение |
|-----|----------|------------|
| `TELEGRAM_BOT_TOKEN` | токен бота из @BotFather (`123456789:AA…`) | Проверка подписи `initData` в `/api/verify`. **Секрет**, не коммитить. |

Шаблон — в `.env.example`. После добавления/изменения переменных сделайте
**Redeploy**, чтобы они применились. Префикс `VITE_` здесь не нужен: токен
используется только на сервере и не должен попадать в клиентский бандл.

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

### Отправка заявок

Форма записи (`src/components/EnrollForm.tsx`) отправляет заявку через
`Telegram.WebApp.sendData(...)` — данные приходят боту, если Mini App открыт
через **reply-keyboard кнопку** `web_app`. Если `sendData` недоступен
(Main Mini App / Menu Button / inline-кнопка / открытие вне Telegram), заявка
уходит менеджеру в **WhatsApp** с заполненным текстом. При необходимости
добавьте отправку на свой backend в помеченном месте кода.
