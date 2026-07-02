# Катарсис — премиальный сайт-визитка караоке-бара

Живые эмоции. Настоящие люди.

## Архитектура

```
Google Таблица (Config / Settings / Users)
       │
       ▼
Google Apps Script ── doGet() → JSON (с конфигом)
│                       doPost() → Telegram (из форм)
│
├── build.js (локально или GitHub Actions)
│     fetch → replace markers → index.html
│
├── GitHub Pages
│     index.html (статический, SEO-теги вшиты)
│
└── Браузер
      index.html со статическими SEO-тегами
      + опциональная runtime-подгрузка шрифтов
```

## Как всё устроено

Единственный файл **`index.html`** содержит маркеры-подстановки:

```html
<title><!-- seo.title -->Катарсис — Караоке-бар<!-- /seo.title --></title>
```

- **Между маркерами** — fallback-значение (видят поисковики, если build не запускался)
- **`build.js`** — Node.js-скрипт (0 зависимостей):
  1. Fetch-ит `doGet()` вашего Google Apps Script
  2. Подставляет актуальные значения вместо маркеров
  3. Сохраняет `index.html` (автоматический commit в GitHub Pages)

**Запуск:**
- Вручную: `node build.js && git add index.html && git commit && git push`
- Из GitHub: **Actions → Build config from Google Sheet → Run workflow** (кнопка)

## Быстрый старт

### 1. Создать Google Таблицу

Структура — **три листа**.

#### Лист `Settings`

| key | value |
|-----|-------|
| bot_token | 8961389382:AAEN-... |

#### Лист `Users`

| Chat ID | Name | Feedback | Booking | Franchise | Active |
|---------|------|----------|---------|-----------|--------|
| 191252645 | Владелец | TRUE | TRUE | TRUE | TRUE |

- `Chat ID` — узнать у [@userinfobot](https://t.me/userinfobot)
- `Feedback/Booking/Franchise` — `TRUE` если пользователь получает этот тип
- `Active` — `TRUE` чтобы включить

#### Лист `Config`

| key | value |
|-----|-------|
| seo.title | Катарсис — премиальный караоке-бар в Казани |
| seo.description | Описание для поисковиков |
| seo.keywords | караоке, казань, катарсис |
| seo.ogImage | https://…/og-image.png |
| fonts.body | 'Inter', sans-serif |
| fonts.heading | 'Unbounded', sans-serif |
| fonts.googleUrl | https://fonts.googleapis.com/… |
| sections.events | FALSE |
| sections.activities | FALSE |
| sections.advantages | TRUE |
| sections.feedback | TRUE |
| sections.booking | TRUE |
| sections.franchise | TRUE |
| contacts.address | ул. Астрономическая, 9, Казань |
| contacts.phone | +7 (843) 200-62-21 |
| contacts.workingHours | Пн-Вс: 20:00 — 06:00 |
| contacts.telegram | https://t.me/katarsis_kzn |
| contacts.vk | https://vk.com/katarsis_kzn |
| contacts.whatsapp | https://wa.me/78432006221 |
| analytics.google_id | G-XXXXXXXXXX |
| analytics.yandex_id | 123456789 |

Значения `TRUE`/`FALSE` (заглавными) преобразуются в булевы.
`analytics.google_id` и `analytics.yandex_id` — оставьте пустыми, если аналитика не нужна.

### 2. Создать Google Apps Script

1. Откройте [script.google.com](https://script.google.com) → Новый проект
2. Вставьте код из **`gas-code.txt`**
3. Замените `SPREADSHEET_ID` на ID вашей таблицы
4. Слева **Сервисы → + → Google Sheets → Добавить**
5. **Развернуть → Новое развертывание → Веб-приложение**
6. Доступ: **Все, у кого есть ссылка**
7. Скопируйте URL веб-приложения (вида `https://script.google.com/macros/s/…/exec`)

### 3. Настроить GitHub Actions

1. Перейдите в репозиторий на GitHub → **Settings → Secrets and variables → Actions**
2. **Variables → New variable** → `GAS_URL` → вставьте URL из шага 2
3. Откройте **Actions → Build config from Google Sheet → Run workflow**

После успешного запуска `index.html` на GitHub Pages обновится с актуальными SEO-тегами, контактами и видимостью секций.

### 4. (опционально) Настроить аналитику

В листе **Config** таблицы:
- `analytics.google_id` — ваш GA4 ID (G-XXXXXXXXXX)
- `analytics.yandex_id` — номер счётчика Яндекс.Метрики

После заполнения запустите Build workflow — скрипты GA4 и Метрики появятся в `index.html`.
Если значения пустые — блоки аналитики неактивны.

## Как вносить изменения

1. Открываете Google Таблицу → редактируете нужную ячейку
2. В Apps Script: **Развернуть → Управлить развертываниями → Новое развертывание**
3. На GitHub: **Actions → Build config → Run workflow**
4. Через минуту сайт обновлён

Или локально:
```bash
node build.js
git add index.html
git commit -m "config update"
git push
```

## Управление секциями

В листе Config колонки `sections.*`:
- `TRUE` — секция видна
- `FALSE` — секция скрыта (вместе с навигацией и футером)

Доступные секции: `events`, `activities`, `advantages`, `feedback`, `booking`, `franchise`.

## WhatsApp-ссылка

В `contacts.whatsapp` формат:
```
https://wa.me/78432006221
```
Где `78432006221` — номер без `+` и без пробелов.

## Формы и Telegram

Формы (отзыв, бронь, франшиза) отправляются **напрямую в `doPost()`** со стороны браузера.
`doPost()` читает токен и права из Google Таблицы и рассылает через Telegram Bot API.

**URL для форм** задаётся в `js/feedback.js`:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/…/exec';
```

## Структура проекта

```
katarsis-site/
├── .github/workflows/build.yml   # GitHub Actions (кнопка обновления)
├── csv/
│   ├── config.csv                 # Шаблон листа Config
│   ├── settings.csv               # Шаблон листа Settings
│   └── users.csv                  # Шаблон листа Users
├── assets/                        # Изображения
├── css/style.css                  # Стили
├── js/
│   ├── main.js                    # Анимации, меню, параллакс
│   ├── particles.js               # Звёзды на canvas
│   └── feedback.js                # Отправка форм
├── index.html                     # Главная страница (с маркерами)
├── privacy.html                   # Политика конфиденциальности
├── build.js                       # Скрипт сборки (Node.js)
└── gas-code.txt                   # Код Google Apps Script
```

## Файлы в .gitignore

- `config.js` — больше не используется (конфиг в таблице)
- `gas-code.txt` — содержит токен, хранится локально
- `*.csv` — шаблоны для импорта, не коммитятся
- `README.md` — документация

## SEO

**Поисковики видят статический HTML с актуальными тегами:**
- `<title>`
- `<meta name="description">`
- `<meta name="keywords">`
- `<meta property="og:image">`

Все теги вшиваются при сборке. JavaScript не участвует.
