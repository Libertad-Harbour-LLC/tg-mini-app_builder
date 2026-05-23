import { useTelegram } from '../useTelegram';
import { SCHOOL } from '../data';

const SOCIALS: { label: string; icon: string; url: string }[] = [
  { label: 'Telegram', icon: '✈️', url: SCHOOL.links.telegram },
  { label: 'WhatsApp', icon: '🟢', url: SCHOOL.links.whatsapp },
  { label: 'ВКонтакте', icon: '🅥', url: SCHOOL.links.vk },
  { label: 'MAX', icon: '🅼', url: SCHOOL.links.max },
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
          <button key={s.label} className="btn btn--secondary social-btn" onClick={() => open(s.url)}>
            <span className="social-btn__icon">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <button className="btn btn--primary" onClick={() => open(SCHOOL.site)}>
        Перейти на сайт
      </button>
    </div>
  );
}
