import { SCHEDULE } from '../data';

export function Schedule({ onEnroll }: { onEnroll: () => void }) {
  return (
    <div className="stack">
      <h2 className="section-title">Ближайшие наборы</h2>

      {SCHEDULE.map((s) => (
        <div className="card" key={s.id}>
          <div className="card__head">
            <div className="card__title">{s.category}</div>
            <span className="badge">{s.start}</span>
          </div>
          <div className="card__subtitle">{s.format}</div>
          {s.note && <div className="hint">{s.note}</div>}
        </div>
      ))}

      <button className="btn btn--primary" onClick={onEnroll}>
        Записаться в группу
      </button>
    </div>
  );
}
