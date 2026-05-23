// Контент автошколы. Отредактируйте под реальные данные школы «Тесла».

export const SCHOOL = {
  name: 'Автошкола Тесла',
  site: 'https://автошколатесла.рф/',
  // TODO: укажите реальные контакты
  phone: '+7 (000) 000-00-00',
  phoneHref: 'tel:+70000000000',
  address: 'г. ____, ул. ____, д. __',
  mapUrl: 'https://yandex.ru/maps/?text=автошкола%20Тесла',
  // TODO: username бота, через который открыт Mini App (без @)
  botUsername: 'your_bot',
};

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  price: number; // руб.
  duration: string;
  highlights: string[];
}

// TODO: проверьте актуальные цены и сроки
export const COURSES: Course[] = [
  {
    id: 'B',
    title: 'Категория B',
    subtitle: 'Легковой автомобиль',
    price: 35000,
    duration: '2.5–3 месяца',
    highlights: ['Теория офлайн/онлайн', 'Вождение на МКПП и АКПП', 'Помощь в сдаче в ГИБДД'],
  },
  {
    id: 'A',
    title: 'Категория A',
    subtitle: 'Мотоцикл',
    price: 18000,
    duration: '1.5–2 месяца',
    highlights: ['Площадка и город', 'Свой мотопарк', 'Гибкий график'],
  },
  {
    id: 'A1',
    title: 'Категория A1',
    subtitle: 'Лёгкий мотоцикл (от 16 лет)',
    price: 16000,
    duration: '1.5 месяца',
    highlights: ['Обучение с 16 лет', 'Опытные инструкторы'],
  },
  {
    id: 'restore',
    title: 'Восстановление навыков',
    subtitle: 'Для тех, кто давно не за рулём',
    price: 1200,
    duration: 'за занятие',
    highlights: ['Индивидуально', 'Город или площадка', 'Любая коробка'],
  },
];

export interface ScheduleItem {
  id: string;
  category: string;
  start: string;
  format: string;
  note?: string;
}

// TODO: обновляйте ближайшие наборы
export const SCHEDULE: ScheduleItem[] = [
  { id: 's1', category: 'Категория B', start: 'Набор открыт', format: 'Вечерние группы (пн/ср/пт)', note: 'Старт по мере набора' },
  { id: 's2', category: 'Категория B', start: 'Набор открыт', format: 'Группа выходного дня', note: 'Сб–Вс' },
  { id: 's3', category: 'Категория A', start: 'Запись', format: 'Индивидуальный график' },
];

export const PROMOS: string[] = [
  'Рассрочка на обучение без процентов',
  'Скидка студентам и при оплате полным курсом',
];

export function formatPrice(rub: number): string {
  return rub.toLocaleString('ru-RU') + ' ₽';
}
