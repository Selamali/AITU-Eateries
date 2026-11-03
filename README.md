# AITU Eateries

A student guide to Cafeteria, Coffee Lake, Sheker and Mokko at Astana IT University. It brings together locations, opening hours, menus, coffee prices and campus photographs. All four spots are on the 1st floor of building C1.

**Team:** Ramazan Anarbekov and Amir Makhymetov, SE-2504.

**Website:** [AITU Eateries on GitHub Pages](https://selamali.github.io/AITU-Eateries/)

**Repository:** [Selamali/AITU-Eateries](https://github.com/Selamali/AITU-Eateries)

## Pages and authors

| File  | What the page contains |
| --- | --- |
| `index.html` | Introduction, links to useful sections, campus map and a twelve-photo dining tour |
| `eateries.html` | Four dining cards, locations, menu-category links, opening hours and a photo gallery |
| `menu.html` | Navigation between four menus, portion and price tables, and a coffee-price comparison |
| `contact.html` | Team biographies, contributions, contact links and a contact-form layout |

Each author is responsible for two HTML pages. Their names also appear in page metadata, footers and team biographies.

## Open the project

Open `index.html` in a browser. Alternatively, run this command from the project folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open [localhost:8000](http://127.0.0.1:8000). Bootstrap, fonts and images are stored with the project. The new jQuery features require access to the jQuery CDN; they are not available offline.

## Project structure

```text
index.html                 Home
eateries.html             Dining Spots
menu.html                  Menus and coffee comparison
contact.html               Team and contact form
css/
  typography.css           Font families, text sizes and responsive type scale
  style.css                Theme, components and responsive layouts
images/                    Logo, map, hero photo, spot photos and team portraits
gallery/                   Twelve photographs shared by the tour and gallery
vendor/
  bootstrap/               Bootstrap 5.3.8 stylesheet and license
  fonts/                   Local font files, font declarations and licenses
favicon.ico                Browser icon
favicon-32.png             PNG browser icon
favicon-180.png            Home-screen icon
```

## How the code is organized

**HTML** defines the content and its meaning: `header`, `nav`, `main`, `section`, `article` and `footer` divide each page into clear parts. Tables hold prices and hours; `figure` and `figcaption` group photographs with captions. English comments identify each main block and explain the classes or attributes used there.

**Bootstrap** supplies components such as `navbar`, `card`, `table`, `btn`, `form-control` and `form-select`. Its `container` limits content width, `row` and `col` arrange columns, `g-4` sets gutters, and `p-*` / `m-*` utilities set padding and margins. Responsive suffixes such as `md` and `lg` apply a class from a specific viewport width.

**Flexbox** handles alignment and one-dimensional layouts. Bootstrap's `row`/`col` layout is built on Flexbox. Classes such as `d-flex`, `flex-column`, `align-items-center`, `justify-content-between` and `mt-auto` align navigation links, card contents, portraits and footer text. The photo tour also uses a custom Flexbox row.

**CSS Grid** handles three custom layouts in `style.css`: `.hero-spots` places names in two columns, `.spots-strip` keeps four dining cards in one row, and `.menu-layout` creates the desktop sidebar and content column. These rules use `display: grid` and `grid-template-columns`.

**Custom CSS** sets the visual theme and refines Bootstrap components. Stylesheets load in this order: local fonts, Bootstrap, `typography.css`, then `style.css`. The shared fonts are Arima Madurai for headings and Mulish for body text. Variables in `:root` hold the palette, corner radius and header height; `--bs-*` variables customize Bootstrap colors and components.

## Responsive layouts and navigation

Layouts follow the browser viewport width. Base styles apply to small screens; `@media` rules adjust them at larger or smaller widths.

| Width | Main adjustments |
| --- | --- |
| Below 576 px | The header uses two rows: logo above the page links. Gallery photos stack in one column. |
| From 576 px | Header content fits in one row; the gallery uses two columns. |
| From 768 px | Text becomes larger, benefit cards use two columns with the third spanning the row, and Name/Email fields sit side by side. |
| From 992 px | The hero and team cards use two columns; benefits and gallery use three. Menu navigation becomes a sidebar. |

The main header stays at the top with `position: sticky`. Menu navigation sits below it: a horizontally scrollable strip below 992 px and a 190 px sidebar from 992 px. `scroll-margin-top` gives anchor targets enough space below the sticky navigation.

Dining cards stay in one horizontal row and scroll within `.spots-strip` when space is limited. Bootstrap `table-responsive` similarly contains wide tables. Links such as `menu.html#sheker-sweets` jump directly to the matching category ID.

## Photos, tables and form

The Home photo tour uses Flexbox, horizontal overflow and CSS scroll snapping. Each slide has an ID; previous/next links point to neighbouring slides and wrap between the first and last photographs. The Dining Spots gallery uses a Bootstrap column layout with captions shown on hover or keyboard focus, and visible by default on touch screens.

Menu tables use **Item | Portion | Price, ₸**. Each portion has its own row; `rowspan` shares an item name across sizes. Category IDs connect the table groups to the tags on Dining Spots. The comparison stores values calculated as `price / volume × 100`, rounded to the nearest tenge; `table-success` highlights the lowest normalized prices.

Menu groups labelled **Demo additions** contain illustrative items. Notes beside the menus identify the Mokko Espresso portion and Sheker Cocoa/Hot chocolate prices that still need confirmation from readable price lists.

The contact form allows users to enter a name, email, dining spot and message. Its `type="button"` control is a placeholder and does not send messages. The team cards provide email and Telegram links for contacting the authors.

## Editing the project

- **Page content:** edit the corresponding HTML file. Keep the shared header and footer consistent across all four pages.
- **Menus:** edit rows in `menu.html`. If a category ID changes, update its links in `eateries.html`. Recalculate comparison values whenever their source prices change.
- **Locations and hours:** update the dining cards and hours table in `eateries.html`; update the map and its caption on Home when needed.
- **Appearance:** change shared colors and dimensions in `css/style.css`, and text sizes in `css/typography.css`.
- **Photos:** replace files in `images/` or `gallery/` and update their `src`, `alt`, `width` and `height` attributes. Later images use `loading="lazy"` to defer loading until needed.
- **Responsive checks:** inspect the pages around 576, 768 and 992 px, then check a narrow phone and a wide desktop. Follow category links and photo arrows, and check that wide content scrolls inside its own region.

Bootstrap's distributed stylesheet is kept intact; project-specific styling belongs in `css/style.css`. Bootstrap and font licenses are included in `vendor/`. Campus photographs come from the project collection; the map and favicon use the supplied artwork.

## Assignment 6 — часть Рамазана

В существующие страницы встроены только Tasks 0, 3, 4, 5 и 9:

| Task | Реализация |
| --- | --- |
| 0 | Полная jQuery 4.0.0 из CDN и внешний `js/script.js` на четырёх страницах; `$(document).ready()` выводит `jQuery is ready!` один раз. |
| 3 | `initFaqSearch()` фильтрует существующий FAQ на Dining Spots и выделяет все буквальные совпадения без учёта регистра. Очистка восстанавливает текст и закрывает ответы. |
| 4 | `initScrollProgress()` обновляет декоративную полосу 3 px через `.scrollTop()`, `.height()` и `.css("transform", ...)`. На короткой странице результат равен нулю, деления на ноль нет. |
| 5 | `initCounters()` один раз анимирует числовой объект через `.animate()` и выводит целые числа через `.text()`: 4 заведения и 62 позиции меню подтверждены разметкой проекта. Итоги есть в HTML; при reduced motion анимация пропускается. |
| 9 | `initLazyImages()` проверяет миниатюры через `.offset()` и `.outerHeight()`, назначает настоящий `src` только при попадании в окно. `.one()` обрабатывает загрузку/ошибку; сбой возвращает заглушку без повторных запросов. |

Счётчик меню учитывает каждую именованную позицию один раз внутри своего заведения: Cafeteria — 19, Coffee Lake — 17, Sheker — 15, Mokko — 11. Разные объёмы одной позиции не увеличивают счётчик. В 62 позиции входят 29 существующих Demo additions; при изменении меню обновлять число в HTML, `data-count` и скрытом тексте для вспомогательных технологий.

Для защиты: `highlightText()` каждый раз берёт сохранённый `originalText`, ищет через `indexOf()` и создаёт текстовые узлы и `<mark>` с `.text()`. Поэтому `[`, `.*` и `<img>` не становятся regex или HTML. Метод рассчитан на текстовые `.faq-text`: ссылки и иконки внутрь этих элементов добавлять нельзя. Существующий обработчик в `site.js` остаётся единственным владельцем ручного раскрытия FAQ.

Передача Амиру:

- Порядок `defer`-скриптов: jQuery → `site.js` → `script.js` → существующие `forms.js` и `coffee-planner.js` на соответствующих страницах. Не добавлять вторую jQuery, Slim или `async`.
- После фильтрации меню или другого изменения высоты вызвать `$(document).trigger("layoutchange")`. Событие обновляет прогресс, ожидающие миниатюры и ещё не запущенные счётчики. FAQ отправляет его после поиска, ручного переключения и CSS-перехода. Для Coffee Planner обработчики в `script.js` отправляют событие после переключения шагов, отправки формы и редактирования бюджета; всплытие событий позволяет дождаться обновления содержимого исходными обработчиками планировщика.
- Доступны общие `.search-panel` и `.search-status`; используются прежние `.form-control`, `.form-label`, `.visually-hidden` и CSS-переменные проекта. Новые стили находятся в `css/style.css`.
- Сохранять пространства имён `.progress`, `.counters`, `.faqSearch`, `.faqLayout`, `.lazyImages`; не вызывать общий `.off("scroll")`. Отслеживание счётчиков и миниатюр отключается после завершения своей работы.
- В галерее настоящий адрес хранится в `data-src` миниатюры. `site.js` читает его до запуска lazy loading и сохраняет в массиве; поэтому стрелки и большой просмотр работают до загрузки миниатюры. Менять фотографии следует через `data-src`, сохраняя `alt`, размеры и данные кнопок.
- Tasks 1, 2, 6, 7, 8 остаются за Амиром. Общий PDF-отчёт, ZIP для сдачи, commit/push и deployment в эту часть не входят.

Проверено 3 ноября 2026: `node --check` для всех четырёх JS-файлов и запуск через локальный HTTP-сервер в Chrome. Пройдены проверки консоли, прогресса (включая короткую страницу и `layoutchange`), однократных счётчиков, reduced motion, FAQ (`Sunday`, `SUNDAY`, `coffee`, пустой запрос, пробелы, `[`, `.*`, `<img>`), клавиатуры, Network с отключённым кэшем, скрытых и ошибочных миниатюр, выбора ещё не загруженной фотографии, якорей и восстановления прокрутки. Проверены прежние формы, диалоги, Coffee Planner, фон, часы и события воспроизведения звука. На четырёх страницах нет общего горизонтального скролла при 320, 375, 768, 1280 и 1440 px; визуально просмотрены Home, FAQ и галерея. Отдельно проверены относительные пути в подпапке и итоговые числа без JavaScript. Safari/Firefox и физические телефоны не проверялись.

Первичные источники: [jQuery ready](https://api.jquery.com/ready/), [animate](https://api.jquery.com/animate/), [one](https://api.jquery.com/one/), [безопасность HTML-методов](https://api.jquery.com/html/), [MDN input](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event), [web.dev: размеры и загрузка изображений](https://web.dev/articles/browser-level-image-lazy-loading).
