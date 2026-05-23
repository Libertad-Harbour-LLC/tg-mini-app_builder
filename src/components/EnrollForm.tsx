import { useState } from 'react';
import { useTelegram } from '../useTelegram';
import { ENROLL_OPTIONS, enrollLabel, SCHOOL } from '../data';

const PHONE_RE = /^\+?[0-9\s\-()]{10,18}$/;

export function EnrollForm({ presetCourse }: { presetCourse?: string }) {
  const { tg, user, haptic } = useTelegram();
  const [name, setName] = useState(user?.first_name ?? '');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(presetCourse ?? ENROLL_OPTIONS[0].value);
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

    const courseLabel = enrollLabel(course);
    const payload = {
      type: 'enroll',
      name: name.trim(),
      phone: phone.trim(),
      course,
      courseLabel,
      comment: comment.trim(),
      tg_user_id: user?.id,
      tg_username: user?.username,
    };

    // Если Mini App открыт через reply-keyboard кнопку web_app — заявка уйдёт боту.
    if (tg && typeof tg.sendData === 'function' && tg.initData) {
      try {
        tg.sendData(JSON.stringify(payload));
        setDone(true);
        return;
      } catch {
        // упадём в фолбэк ниже
      }
    }

    // Фолбэк: отправка заявки менеджеру через WhatsApp с заполненным текстом.
    const lines = [
      'Заявка на обучение (Автошкола Тесла)',
      `Имя: ${payload.name}`,
      `Телефон: ${payload.phone}`,
      `Тариф: ${courseLabel}`,
    ];
    if (payload.comment) lines.push(`Комментарий: ${payload.comment}`);
    const waUrl = `https://api.whatsapp.com/send?phone=${SCHOOL.whatsappPhone}&text=${encodeURIComponent(
      lines.join('\n'),
    )}`;
    if (tg?.openLink) tg.openLink(waUrl);
    else window.open(waUrl, '_blank');

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
          <span className="field__label">Тариф</span>
          <select className="input" value={course} onChange={(e) => setCourse(e.target.value)}>
            {ENROLL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
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
