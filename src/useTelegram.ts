import { useEffect, useState } from 'react';
import type { TelegramWebApp } from './telegram';
import { verifyInitData } from './api';

const tg: TelegramWebApp | undefined = window.Telegram?.WebApp;

function applyTheme(webApp: TelegramWebApp) {
  const p = webApp.themeParams;
  const root = document.documentElement;
  const set = (name: string, value?: string) => {
    if (value) root.style.setProperty(name, value);
  };
  set('--tg-bg', p.bg_color);
  set('--tg-text', p.text_color);
  set('--tg-hint', p.hint_color);
  set('--tg-link', p.link_color);
  set('--tg-button', p.button_color);
  set('--tg-button-text', p.button_text_color);
  set('--tg-secondary-bg', p.secondary_bg_color);
  root.dataset.theme = webApp.colorScheme;
}

export function useTelegram() {
  const [scheme, setScheme] = useState<'light' | 'dark'>(tg?.colorScheme ?? 'light');
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    applyTheme(tg);
    const onTheme = () => {
      applyTheme(tg);
      setScheme(tg.colorScheme);
    };
    tg.onEvent('themeChanged', onTheme);

    verifyInitData(tg.initData).then((res) => {
      if (res) setVerified(res.ok);
    });

    return () => tg.offEvent('themeChanged', onTheme);
  }, []);

  const haptic = (style: 'light' | 'medium' | 'heavy' = 'light') =>
    tg?.HapticFeedback?.impactOccurred(style);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    scheme,
    isTelegram: Boolean(tg),
    verified,
    haptic,
  };
}
