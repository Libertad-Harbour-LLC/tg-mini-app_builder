import { useState } from 'react';
import { CATEGORIES, PROMOS } from '../data';

export function Courses({ onEnroll }: { onEnroll: (enrollValue?: string) => void }) {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const category = CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  return (
    <div className="stack">
      <h2 className="section-title">Категории и цены</h2>

      <div className="chips">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip${c.id === activeCat ? ' chip--active' : ''}`}
            onClick={() => setActiveCat(c.id)}
          >
            {c.title}
          </button>
        ))}
      </div>

      {category.caption && <div className="hint">{category.caption}</div>}

      {category.tariffs.map((t) => (
        <div className="card" key={t.id}>
          <div className="card__head">
            <div>
              <div className="card__title">{t.title}</div>
              {t.note && <div className="card__subtitle">{t.note}</div>}
            </div>
            <div className="price">
              <div className="price__value">{t.price}</div>
            </div>
          </div>
          <ul className="bullets">
            {t.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <button className="btn btn--primary" onClick={() => onEnroll(`${category.id}:${t.id}`)}>
            Оставить заявку
          </button>
        </div>
      ))}

      {category.extras && category.extras.length > 0 && (
        <>
          <h3 className="section-title section-title--sub">Дополнительные услуги</h3>
          {category.extras.map((e, i) => (
            <div className="card" key={i}>
              <div className="card__head">
                <div className="card__title card__title--sm">{e.title}</div>
                <div className="price">
                  <div className="price__value">{e.price}</div>
                </div>
              </div>
              {e.details && (
                <ul className="bullets">
                  {e.details.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {PROMOS.length > 0 && (
        <div className="card card--accent">
          <div className="card__title">Акции</div>
          <ul className="bullets">
            {PROMOS.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
