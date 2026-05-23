import { useState } from 'react';
import { useTelegram } from '../useTelegram';
import { COURSES, SCHOOL } from '../data';

const PHONE_RE = /^\+?[0-9\s\-()]{10,18}$/;

export function EnrollForm({ presetCourse }: { presetCourse?: string }) {
  const { tg, user, haptic } = useTelegram();
  const [name, setName] = useState(user?.first_name ?? '');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(presetCourse ?? COURSES[0].id);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = name.trim().length >= 2 && PHONE_RE.test(phone.trim());

  const submit = () => {
    setError(null);
    if (!valid) {
      setError('Укажите имя и корректный телефон.');
      haptic('heavy');
      return;
    }
    setSubmitting(true);
    haptic('medium');

    const courseTitle = COURSES.find((c) => c.id === course)?.title ?? course;
    const payload = {
      type: 'enroll',
      name: name.trim(),
      phone: phone.trim(),
      course,
      courseTitle,
      comment: comment.trim(),
      tg_user_id: user?.id,
      tg_username: user?.username,
    };

    if (tg && typeof tg.sendData === 'function' && tg.initData) {
      try {
        tg.sendData(JSON.stringify(payload));
        // Telegram закроет приложение и передаст данные боту.
        setDone(true);
        return;
      } catch {
        // упадём в фолбэк ниже
      }
    }

    // Фолбэк: открыть диалог с ботом (вне keyboard-кнопки sendData недоступен).
    const text = `Заявка на обучение%0AИмя: ${encodeURIComponent(
      payload.name,
    )}%0AТелефон: ${encodeURIComponent(payload.phone)}%0AКатегория: ${encodeURIComponent(
      courseTitle,
    )}${payload.comment ? '%0AКомментарий: ' + encodeURIComponent(payload.comment) : ''}`;
    const link = `https://t.me/${SCHOOL.botUsername}?start=enroll`;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(link);
    } else {
      window.open(link, '_blank');
    }
    // Дополнительно: можно отправить заявку на свой backend здесь.
    console.log('enroll payload', payload, text);
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="stack">
        <div className="card card--accent center">
          <div className="success-emoji">✅</div>
          <div className="card__title">Заявка отправлена!</div>
          <div className="hint">Мы свяжемся с вами для подтверждения записи.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <h2 className="section-title">Запись на обучение</h2>

      <div className="card">
        <label className="field">
          <span className="field__label">Ваше имя</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван"
            autoComplete="name"
          />
        </label>

        <label className="field">
          <span className="field__label">Телефон</span>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>

        <label className="field">
          <span className="field__label">Категория</span>
          <select className="input" value={course} onChange={(e) => setCourse(e.target.value)}>
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} — {c.subtitle}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Комментарий (необязательно)</span>
          <textarea
            className="input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Удобное время, вопросы…"
            rows={3}
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="btn btn--primary" onClick={submit} disabled={submitting}>
          {submitting ? 'Отправляем…' : 'Отправить заявку'}
        </button>
        <div className="hint center">Нажимая кнопку, вы соглашаетесь на обработку данных.</div>
      </div>
    </div>
  );
}
