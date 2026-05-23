import { useEffect, useRef, useState } from 'react';
import { useTelegram } from '../useTelegram';
import { sendChat, type ChatMessage } from '../api';

const GREETING =
  'Здравствуйте! Я виртуальный ассистент автошколы «ТЕСЛА». ' +
  'Спросите о категориях, тарифах, сроках обучения, филиалах или рассрочке.';

const SUGGESTIONS = [
  'Сколько стоит категория B?',
  'С какого возраста можно учиться?',
  'Где находятся филиалы?',
  'Как работает рассрочка?',
];

export function Assistant() {
  const { tg } = useTelegram();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendChat(next, tg?.initData);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setError('Не удалось получить ответ. Попробуйте ещё раз или позвоните: +7 (939) 505 02-10.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant">
      <h2 className="section-title">ИИ-ассистент</h2>

      <div className="chat">
        <div className="bubble bubble--bot">{GREETING}</div>

        {messages.map((m, i) => (
          <div key={i} className={`bubble bubble--${m.role === 'user' ? 'user' : 'bot'}`}>
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="bubble bubble--bot bubble--typing">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {messages.length === 0 && !loading && (
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напишите вопрос…"
          disabled={loading}
        />
        <button className="btn btn--primary chat-send" type="submit" disabled={loading || !input.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
}
