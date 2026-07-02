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

## 🤖 Настройка Telegram-бота (с таблицей пользователей)

Вся админка бота живёт в **Google Таблице**:
- токен бота
- список получателей уведомлений
- права (кто получает отзывы, бронь, франшизу)

### Шаг 1. Создать бота в Telegram

1. Откройте Telegram: [@BotFather](https://t.me/BotFather)
2. Напишите `/newbot`
3. Название: `Катарсис Отзывы`
4. Username: `katarsis_feedback_bot`
5. BotFather пришлёт **токен** — сохраните его

### Шаг 2. Создать Google Таблицу

Сделайте копию шаблона:  
👉 **[Ссылка на шаблон таблицы](https://docs.google.com/spreadsheets/d/1EIAOzR4I9gy_L1vXMIHYFKqMJNN8TBZvV9GQ2oA71-A/copy)**

В таблице два листа:

**Лист `Settings`** — токен бота:
| Key | Value |
|-----|-------|
| bot_token | 8961389382:AAEN-... (ваш токен) |

**Лист `Users`** — пользователи с правами:
| Chat ID | Name | Feedback | Booking | Franchise | Active |
|---------|------|----------|---------|-----------|--------|
| 191252645 | Владелец | TRUE | TRUE | TRUE | TRUE |

Заполните:
- `Chat ID` — узнайте у [@userinfobot](https://t.me/userinfobot) (только цифры)
- `Name` — имя пользователя
- `Feedback` / `Booking` / `Franchise` — `TRUE` если можно, `FALSE` если нет
- `Active` — `TRUE` чтобы включить

Хотите добавить второго менеджера? Просто добавьте строку в таблицу.

### Шаг 3. Получить ID таблицы

Откройте таблицу → в адресной строке браузера найдите **id**:

```
https://docs.google.com/spreadsheets/d/1EIAOzR4I9gy_L1vXMIHYFKqMJNN8TBZvV9GQ2oA71-A/edit
                                        ↑←────────── ЭТО ID ──────────→↑
```

Скопируйте этот ID.

### Шаг 4. Создать Google Apps Script

1. Откройте: [script.google.com](https://script.google.com)
2. Нажмите **"Новый проект"**
3. Удалите весь код и вставьте код из файла **`gas-code.txt`** (лежит в корне проекта)
4. Найдите в начале строку:
   ```javascript
   const SPREADSHEET_ID = 'ВСТАВЬТЕ_ID_ТАБЛИЦЫ';
   ```
5. Замените `'ВСТАВЬТЕ_ID_ТАБЛИЦЫ'` на скопированный ID таблицы
6. Нажмите **Сохранить** → имя проекта `KatarsisBot`
7. Слева в списке сервисов нажмите **+** → **"Google Sheets"** → **Добавить**
8. Нажмите **"Развернуть"** → **"Новое развертывание"** → **"Веб-приложение"**
9. Выберите: **"Все, у кого есть ссылка"**
10. Нажмите **"Развернуть"**
11. Скопируйте **URL веб-приложения** (вида `https://script.google.com/macros/s/.../exec`)

### Шаг 5. Подключить к сайту

1. Откройте файл `js/feedback.js`
2. Найдите строку: `const GOOGLE_SCRIPT_URL = '...'`
3. Замените на скопированный URL
4. Сохраните и заново загрузите файлы на GitHub

### 🐛 Где смотреть логи

1. [script.google.com](https://script.google.com) → ваш проект
2. Слева меню **"Выполнения"** (Executions) — все запросы и ошибки
3. Нажмите на запуск → увидите лог (console.log)
4. Если проблема на сайте: **F12 → Console** — отправьте форму

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
