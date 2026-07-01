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
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('📥 Получен запрос:', JSON.stringify(data)); // ← лог

    const token = 'ВАШ_ТОКЕН_БОТА';
    const chatId = 'ВАШ_CHAT_ID';     // ⚠️ ТОЛЬКО цифры, без "Id: "

    let text = '';
    switch(data.type) {
      case 'feedback':
        text = '✉️ *Новый отзыв!*\n👤 Имя: ' + data.name + '\n📞 Телефон: ' + data.phone + '\n⭐ Рейтинг: ' + (data.rating || 'не указан') + '\n💬 ' + data.message;
        break;
      case 'booking':
        text = '🍽 *Бронирование банкета*\n👤 Имя: ' + data.name + '\n📞 Телефон: ' + data.phone + '\n📅 Дата: ' + data.date + '\n👥 Гостей: ' + data.guests + '\n📝 Пожелания: ' + (data.notes || 'нет');
        break;
      case 'franchise':
        text = '📊 *Заявка на франшизу*\n👤 Имя: ' + data.name + '\n📞 Телефон: ' + data.phone + '\n📧 Email: ' + data.email + '\n🏙 Город: ' + data.city;
        break;
    }

    console.log('📤 Отправка в Telegram...');
    const result = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post',
      payload: { chat_id: chatId, text: text, parse_mode: 'Markdown' }
    });
    console.log('✅ Ответ:', result.getContentText());

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('❌ Ошибка:', error.message); // ← лог ошибки
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Замените `ВАШ_ТОКЕН_БОТА` и `ВАШ_CHAT_ID` на свои  
   ⚠️ **ВАЖНО:** в `chatId` пишите **только цифры**, без «Id:»  
   ✅ Правильно: `'191252645'`  
   ❌ Неправильно: `'Id: 191252645'`
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

### 🐛 Где смотреть логи

1. Откройте [script.google.com](https://script.google.com) → ваш проект
2. Слева меню **"Выполнения"** (Executions) — там все запросы и ошибки
3. Нажмите на любой запуск — увидите **лог** (все console.log)
4. Если проблема на сайте: **F12 → Console** — отправьте форму, будут ошибки JS

---

## ⚙️ Админ-файл `config.js`

Все настройки сайта в одном файле. Просто меняете значения — секции включаются/выключаются, шрифты и SEO меняются.

### Секции (показать/скрыть)

```js
sections: {
  events:      false,  // Баннеры «Скоро»
  activities:  false,  // Активности
  advantages:  true,   // Преимущества
  feedback:    true,   // Кнопка отзыва
  booking:     true,   // Кнопка брони
  franchise:   true,   // Кнопка франшизы
}
```

Поменяли `false` на `true` — секция появится на сайте.

### Шрифты

```js
fonts: {
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "'Unbounded', 'Inter', sans-serif",
  googleUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Unbounded:wght@300;400;500;600;700;800;900&display=swap",
}
```

- `body` — шрифт для текста
- `heading` — шрифт для заголовков (удлинённый)
- `googleUrl` — ссылка для подключения шрифтов (если нужен другой — меняйте)

Хотите другой шрифт? Пример:
```js
heading: "'Raleway', sans-serif",
googleUrl: "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap",
```

### SEO

```js
seo: {
  title: '...',
  description: '...',
  keywords: '...',
  ogImage: 'assets/hero-image.png',
}
```

Меняете — и на сайте новые заголовки для поисковиков.

### Контакты

```js
contacts: {
  address: 'ул. Астрономическая, 9, Казань',
  phone: '+7 (999) 123-45-67',
  workingHours: 'Пн-Вс: 18:00 — 06:00',
  telegram: 'https://t.me/...',
  vk: 'https://vk.com/...',
  whatsapp: 'https://wa.me/...',
}
```

---

## 📁 Структура

```
katarsis/
├── index.html        # Главная страница
├── config.js         # ⚙️ АДМИНКА: секции, шрифты, SEO, контакты
├── css/
│   └── style.css     # Все стили
├── js/
│   ├── main.js       # Анимации, меню, параллакс
│   ├── particles.js  # Звёзды на canvas
│   └── feedback.js   # Отправка форм
├── assets/
│   ├── logo.png      # Логотип
│   ├── favicon.png   # Иконка
│   ├── hero-image.png
│   ├── bg-hero.png
│   ├── event1.png
│   ├── event2.png
│   ├── bot-pic.png   # Картинка для Telegram бота
│   └── ...
├── gas-code.txt      # Код для Google Apps Script
└── README.md
```

---

## 💡 Фичи сайта

- ⚙️ **Админка** `config.js` — включение/выключение разделов без кода
- 🕵️ **Age Verify** 18+ — модальное окно при входе
- ✨ **Частицы** — звёзды на canvas с реакцией на мышь
- 🌫️ **Дым-эффект** — CSS-анимация тумана
- 🪟 **Glassmorphism** — стеклянные карточки
- 💡 **Неон** — свечение заголовков и кнопок
- 📜 **Параллакс** — при скролле
- 🔢 **Анимированные счётчики**
- 📱 **Адаптация под мобильные**
- ✉️ **Форма отзыва** с рейтингом → Telegram через Google Apps Script
