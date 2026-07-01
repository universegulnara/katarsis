# 🎭 Катарсис — премиальный сайт-визитка

Живые эмоции. Настоящие люди.

## 🚀 Быстрый старт (деплой на GitHub Pages)

### 1. Создать репозиторий на GitHub

1. Зайдите на [github.com](https://github.com) и войдите в аккаунт
2. Нажмите зелёную кнопку **"New"**
3. Название: `katarsis` (или любое другое)
4. Оставьте **Public**
5. Нажмите **"Create repository"**

### 2. Загрузить файлы

```bash
# Клонируем репозиторий к себе
git clone https://github.com/ВАШ_ЛОГИН/katarsis.git
cd katarsis

# Копируем файлы сайта в папку репозитория
# (скопируйте всё из папки katarsis-site в текущую папку)

# Отправляем на GitHub
git add .
git commit -m "Первый коммит — сайт Катарсис"
git push origin main
```

### 3. Включить GitHub Pages

1. Зайдите в репозиторий на GitHub
2. **Settings** → **Pages**
3. В разделе **"Branch"** выберите `main` и `/ (root)`
4. Нажмите **Save**
5. Через 1-2 минуты сайт будет доступен по адресу:
   `https://ВАШ_ЛОГИН.github.io/katarsis/`

---

## 🤖 Настройка Telegram-бота (для формы отзыва)

### Шаг 1. Создать бота

1. Откройте Telegram: [@BotFather](https://t.me/BotFather)
2. Напишите `/newbot`
3. Введите название: `Катарсис Отзывы`
4. Введите username: `katarsis_feedback_bot`
5. BotFather пришлёт **токен** — сохраните его

### Шаг 2. Узнать ваш Chat ID

1. Напишите боту [@userinfobot](https://t.me/userinfobot)
2. Нажмите **Start**
3. Бот пришлёт: `Id: 123456789` — это ваш `TG_CHAT_ID`

### Шаг 3. Создать Google Apps Script

1. Откройте: [script.google.com](https://script.google.com)
2. Нажмите **"Новый проект"**
3. Удалите весь код и вставьте этот:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const token = 'ВАШ_ТОКЕН_БОТА';
  const chatId = 'ВАШ_CHAT_ID';

  let text = '';
  switch(data.type) {
    case 'feedback':
      text = `✉️ *Новый отзыв!*
👤 Имя: ${data.name}
📞 Телефон: ${data.phone}
⭐ Рейтинг: ${data.rating || 'не указан'}
💬 ${data.message}`;
      break;
    case 'booking':
      text = `🍽 *Бронирование банкета*
👤 Имя: ${data.name}
📞 Телефон: ${data.phone}
📅 Дата: ${data.date}
👥 Гостей: ${data.guests}
📝 Пожелания: ${data.notes || 'нет'}`;
      break;
    case 'franchise':
      text = `📊 *Заявка на франшизу*
👤 Имя: ${data.name}
📞 Телефон: ${data.phone}
📧 Email: ${data.email}
🏙 Город: ${data.city}`;
      break;
  }

  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    payload: {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    }
  });

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Замените `ВАШ_ТОКЕН_БОТА` и `ВАШ_CHAT_ID` на свои
5. Нажмите **Сохранить** → дайте имя проекту (например `KatarsisBot`)
6. Нажмите **"Развернуть"** → **"Новое развертывание"** → **"Веб-приложение"**
7. Выберите: **"Все, у кого есть ссылка"**
8. Нажмите **"Развернуть"**
9. Скопируйте **URL веб-приложения** (вида `https://script.google.com/macros/s/.../exec`)

### Шаг 4. Подключить к сайту

1. Откройте файл `js/feedback.js`
2. Найдите строку: `const GOOGLE_SCRIPT_URL = '...'`
3. Замените на скопированный URL
4. Сохраните и заново загрузите файлы на GitHub

### 🐛 Если не работает — проверка логов

1. Откройте [script.google.com](https://script.google.com) → ваш проект
2. Слева меню **"Выполнения"** (Executions)
3. Там видно: приходил ли запрос и какая ошибка
4. Если ошибка: проверьте токен и chat_id
5. Если запросов нет: откройте F12 на сайте → вкладка Console → отправьте форму — будут видны ошибки JS

---

## 🎨 Цветовая палитра

| Название | Цвет | Код |
|----------|------|-----|
| Тёмный фон | ▪️ | `#0a0a1a` |
| Ещё темнее | ▪️ | `#060612` |
| Неон-фиолетовый | ▪️ | `#c990ff` |
| Неон-синий | ▪️ | `#536dfe` |
| Неон-розовый | ▪️ | `#ff6ec7` |
| Текст | ▪️ | `#f0eeff` |

## 📁 Структура

```
katarsis/
├── index.html        # Главная страница
├── css/
│   └── style.css     # Все стили
├── js/
│   ├── main.js       # Анимации, меню, параллакс
│   ├── particles.js  # Звёзды на canvas
│   └── feedback.js   # Отправка форм
├── assets/
│   ├── logo.svg      # Логотип
│   └── favicon.png   # Иконка
└── README.md
```

---

## 💡 Фичи сайта

- Age Verify 18+ (модальное окно при входе)
- Частицы (звёзды) с реакцией на мышь
- Дым-эффект (CSS анимация)
- Glassmorphism (стеклянные карточки)
- Неон-свечение заголовков и кнопок
- Параллакс при скролле
- Анимированные счётчики
- Адаптация под мобильные устройства
- Форма отзыва с рейтингом → Telegram
