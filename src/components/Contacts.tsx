import type { ReactNode } from 'react';
import { useTelegram } from '../useTelegram';
import { SCHOOL } from '../data';
import { TelegramIcon, WhatsAppIcon, VkIcon, MaxIcon, GlobeIcon } from './icons';

const SOCIALS: { label: string; icon: ReactNode; url: string; brand: string }[] = [
  { label: 'Telegram', icon: <TelegramIcon />, url: SCHOOL.links.telegram, brand: '#229ED9' },
  { label: 'WhatsApp', icon: <WhatsAppIcon />, url: SCHOOL.links.whatsapp, brand: '#25D366' },
  { label: 'ВКонтакте', icon: <VkIcon />, url: SCHOOL.links.vk, brand: '#0077FF' },
  { label: 'MAX', icon: <MaxIcon />, url: SCHOOL.links.max, brand: '#7B61FF' },
];

export function Contacts() {
  const { tg } = useTelegram();

  const open = (url: string) => {
    if (tg?.openLink) tg.openLink(url);
    else window.open(url, '_blank');
  };

  return (
    <div className="stack">
      <h2 className="section-title">Контакты</h2>

      <div className="card">
        <div className="contact-row">
          <span className="contact-row__icon">📞</span>
          <a className="contact-row__link" href={SCHOOL.phoneHref}>
            {SCHOOL.phone}
          </a>
        </div>
      </div>

      <h3 className="section-title section-title--sub">Мы на связи</h3>
      <div className="grid2">
        {SOCIALS.map((s) => (
          <button
            key={s.label}
            className="btn social-btn"
            style={{ '--brand': s.brand } as React.CSSProperties}
            onClick={() => open(s.url)}
          >
            <span className="social-btn__icon">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <button className="btn btn--primary site-btn" onClick={() => open(SCHOOL.site)}>
        <GlobeIcon />
        Перейти на сайт
      </button>
    </div>
  );
}
