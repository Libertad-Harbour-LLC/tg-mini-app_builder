import { COURSES, PROMOS, formatPrice } from '../data';

export function Courses({ onEnroll }: { onEnroll: (courseId?: string) => void }) {
  return (
    <div className="stack">
      <h2 className="section-title">Категории и цены</h2>

      {COURSES.map((c) => (
        <div className="card" key={c.id}>
          <div className="card__head">
            <div>
              <div className="card__title">{c.title}</div>
              <div className="card__subtitle">{c.subtitle}</div>
            </div>
            <div className="price">
              <div className="price__value">{formatPrice(c.price)}</div>
              <div className="price__note">{c.duration}</div>
            </div>
          </div>
          <ul className="bullets">
            {c.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
          <button className="btn btn--primary" onClick={() => onEnroll(c.id)}>
            Записаться на «{c.title}»
          </button>
        </div>
      ))}

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
