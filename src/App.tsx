import { useState } from 'react';
import { useTelegram } from './useTelegram';
import { SCHOOL } from './data';
import { Courses } from './components/Courses';
import { Schedule } from './components/Schedule';
import { EnrollForm } from './components/EnrollForm';
import { Contacts } from './components/Contacts';

type Tab = 'courses' | 'schedule' | 'enroll' | 'contacts';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'courses', label: 'Курсы', icon: '🚗' },
  { id: 'schedule', label: 'Расписание', icon: '📅' },
  { id: 'enroll', label: 'Запись', icon: '📝' },
  { id: 'contacts', label: 'Контакты', icon: '📍' },
];

export default function App() {
  const { user, haptic } = useTelegram();
  const [tab, setTab] = useState<Tab>('courses');
  const [presetCourse, setPresetCourse] = useState<string | undefined>();

  const goEnroll = (courseId?: string) => {
    setPresetCourse(courseId);
    setTab('enroll');
    haptic('medium');
  };

  const switchTab = (id: Tab) => {
    if (id !== tab) haptic('light');
    setTab(id);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header__title">{SCHOOL.name}</div>
        <div className="header__sub">
          {user ? `Здравствуйте, ${user.first_name}!` : 'Обучение вождению'}
        </div>
      </header>

      <main className="content">
        {tab === 'courses' && <Courses onEnroll={goEnroll} />}
        {tab === 'schedule' && <Schedule onEnroll={() => goEnroll()} />}
        {tab === 'enroll' && <EnrollForm presetCourse={presetCourse} />}
        {tab === 'contacts' && <Contacts />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tabbar__item${tab === t.id ? ' tabbar__item--active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            <span className="tabbar__icon">{t.icon}</span>
            <span className="tabbar__label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
