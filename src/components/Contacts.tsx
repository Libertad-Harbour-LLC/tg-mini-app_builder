import { useTelegram } from '../useTelegram';
import { SCHOOL } from '../data';

export function Contacts() {
  const { tg } = useTelegram();

  const openSite = () => {
    if (tg?.openLink) tg.openLink(SCHOOL.site);
    else window.open(SCHOOL.site, '_blank');
  };

  const openMap = () => {
    if (tg?.openLink) tg.openLink(SCHOOL.mapUrl);
    else window.open(SCHOOL.mapUrl, '_blank');
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
        <div className="contact-row">
          <span className="contact-row__icon">📍</span>
          <span>{SCHOOL.address}</span>
        </div>
      </div>

      <button className="btn btn--primary" onClick={openMap}>
        Открыть на карте
      </button>
      <button className="btn btn--secondary" onClick={openSite}>
        Перейти на сайт
      </button>
    </div>
  );
}
