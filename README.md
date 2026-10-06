# AITU Eateries

An offline-ready student guide to Cafeteria, Coffee Lake, Sheker and Mokko at Astana IT University. All four spots are on the 1st floor of building C1.

Team: Ramazan Anarbekov and Amir Makhymetov · SE-2504.

**Live website:** https://selamali.github.io/AITU-Eateries/

**Repository:** https://github.com/Selamali/AITU-Eateries

Use the live website URL in the online text field when submitting the assignment.

## Run locally

Open `index.html` in a browser, or start a local server from this folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8000. No installation or build step is required. Only HTML and CSS are used. Bootstrap 5.3.8 CSS, fonts and images are included locally. There are no JavaScript files, inline scripts or Bootstrap JavaScript bundle. Telegram and email links use the user's external apps.

## Pages and authors

Each page has one author, recorded in its metadata and footer as well as the team biographies.

| Page | Author | Contents |
| --- | --- | --- |
| `index.html` — Home | Ramazan Anarbekov | Hero with four color-coded names, three benefits with action buttons, campus map, twelve-photo Campus dining tour using HTML links and CSS scrolling |
| `eateries.html` — Dining Spots | Ramazan Anarbekov | Four spot cards in one horizontal strip, linked menu categories, hours table, original twelve-photo gallery |
| `menu.html` — Menu | Amir Makhymetov | HTML anchor navigation, four menus, coffee comparison |
| `contact.html` — Contact | Amir Makhymetov | Two complete team biographies and an inactive demo form layout |

The separate media-query demonstration and its stylesheet have been removed. Responsive typography remains in `css/typography.css`. Decorative subtitles above page titles and spot names have been removed.

## Files and shared design

- `vendor/bootstrap/`: Bootstrap 5.3.8 CSS and MIT license.
- `vendor/fonts/`: local Arima Madurai and Mulish fonts, CSS and SIL Open Font Licenses.
- `css/typography.css`: shared mobile-first heading, paragraph, list and table text scale; `small` text is 14 px.
- `css/style.css`: Bootstrap theme overrides, component appearance and responsive exceptions. No custom `!important` rules.
- `images/`: optimized site photographs, portraits, logo and updated campus map. The Cafeteria and Mokko main photographs use canonical filenames.
- `gallery/`: optimized campus photographs; Dining Spots restores all twelve gallery photographs from the supplied original archive.
- `favicon.ico`, `favicon-32.png`, `favicon-180.png`: icons prepared from the supplied favicon artwork.

The theme uses #187f42 for actions, #105b30 for hover, #f7f8f3 for the page background, #1b1d19 for text and #5b5e55 for secondary text. Four decorative spot colors are limited to markers and accent borders. Cards, photographs, tables, the photo tour and form surfaces use a 12 px radius. Primary buttons are pill-shaped with a minimum 44 px height. Compact tag links are 32 px high; photo arrow links are 48 px square. Sections use the original `py-4 py-lg-5` spacing, headings `mb-3`, and card grids use `row-cols-*` and `g-4`. Dining cards have a colored left border, the photo above the title, a prominent location, and quieter opening hours. All four share one horizontal row. On narrower screens the strip scrolls within its own region using touch, a trackpad or the keyboard; the document itself does not overflow. Introductory text has bounded line lengths, Menu content is at most 960 px wide, and the Contact form is at most 800 px wide. Gallery captions appear over photographs on hover or keyboard focus and remain visible on touch devices.

Each page has a skip link, semantic landmarks, one h1 and a current-page navigation marker. Header and footer markup is repeated in these static files; update all four copies together.

## Content and data

All prices and hours are static HTML. There are 62 named menu items: 33 original items and 29 illustrative additions. The 47 priced variants in the original tables are preserved. Missing larger sizes are not invented. One portion and price occupy each row, with shared item names spanning variant rows. Category anchors are used by the tags on Dining Spots.

New groups are visibly marked **Demo additions**. They are illustrative, not verified offerings. The site asks readers to confirm availability and current prices at the counter.

The comparison uses the smallest listed size at each spot. Americano per 100 ml: 214 / 330 / 180 ₸; Latte: 243 / 330 / 200 ₸ for Sheker / Mokko / Coffee Lake. Figures are rounded to the nearest tenge. Coffee Lake's drinks are iced, and this difference is stated alongside the comparison. The two lowest normalized prices use `table-success`.

Hours retain the supplied base information:

| Spot | Days | Hours |
| --- | --- | --- |
| Cafeteria | Mon–Fri | 9:00–20:00 |
| Coffee Lake | Mon–Sat | 9:00–20:00 |
| Sheker | Mon–Sat | 10:00–19:30 |
| Mokko | Mon–Fri | 10:00–19:00 |

Sundays: all spots closed. The displayed `Last checked` date is **6 October 2026**, the date of this revision; a different submission date was not supplied. This is not a new on-site verification of hours.

### Items awaiting source confirmation

The supplied project and archive contain venue and food photographs, but no readable close-up price lists that establish the following details:

- **Mokko Espresso:** 990 ₸ is retained. The original table placed it under 300 ml. The proposed 40 ml replacement is not confirmed, so the portion is displayed as **To confirm** instead of publishing an unsupported volume.
- **Sheker Hot chocolate and Cocoa:** the original 890 ₸ for 350 ml and 1 290 ₸ for 450 ml remain unchanged and are explicitly flagged for confirmation.

Once readable source price lists are available, update the relevant portions/prices and remove the associated notes.

## Demo contact form

The form explicitly says **Demo form: messages are not sent**. It is an inactive Bootstrap form layout: the fieldset and its button are disabled with HTML attributes. There is no submission, validation script or simulated success message. Actual email and Telegram links are available in the team cards above it.

## Images and map

Photographs were resized and compressed, reducing the image folders from about 22.0 MB to 3.7 MB (decimal units). Actual width and height attributes reserve space. Images below the first view use lazy loading; the logo and Home hero load eagerly.

The Home map is a byte-for-byte copy of the supplied `aitu_eateriesmap2.jpg` (1920 × 1080). No label edits, regeneration, recoloring or recompression were applied in this revision. It is stored as `images/campus-map.jpg`.

The Home photo tour keeps all twelve photographs from the original carousel in the same order. A CSS scroll-snap strip and ordinary previous/next anchor links replace the JavaScript carousel. Touch, trackpad and keyboard scrolling also work. The original twelve-photo gallery remains on Dining Spots, including hover/focus captions. Existing optimized photo files are reused.

## Navigation without JavaScript

All four header links are always visible, including on phones. The Menu page displays all five sections. Its five navigation links and Dining Spots category links use ordinary HTML fragments such as `menu.html#sheker-sweets`. There are no tabs, hidden panels or JavaScript-dependent controls.

## Assignment requirements

| Requirement | Implementation |
| --- | --- |
| Responsiveness | Desktop, tablet and mobile layouts; 320–1920 px and landscape checked; contained scrolling for wide tables and the card strip |
| Hosting | GitHub Pages at the URL above; plain static HTML with local assets and `.nojekyll` |
| Design quality | Readable shared palette, consistent spacing, bounded text widths, working images and links |
| Team ownership | Ramazan: Home and Dining Spots; Amir: Menu and Contact — two HTML pages each, stated in metadata, biographies and footers |
| Feature cohesion | Location guide, opening hours, food menus, coffee comparison, campus photos and team contacts; the unrelated responsive-design demo was removed |

## Verification — HTML and CSS edition, 6 October 2026

- No JavaScript files, script elements, event-handler attributes, `javascript:` links or Bootstrap JavaScript attributes remain. Normal pages load zero scripts.
- W3C Nu HTML Checker: all four pages passed with no errors, warnings or informational messages.
- axe-core: all four pages at 320 and 1280 px produced zero automatic violations. Some contrast cases on Home and Menu require manual review; this is not a complete accessibility certification.
- All four pages were checked at actual CSS widths 320, 375, 576, 768, 820, 991, 992, 1024, 1280 and 1920 px, plus 844 × 390 landscape: 44 cases without page-level horizontal overflow. All four header links remain visible.
- Photo links were checked forward, backward and across the first/last photograph. All five menu sections remain visible, and comparison/category links use standard HTML anchors. The contact fieldset is disabled.
- Local links, fragment targets, image dimensions, 47 original priced variants, 29 demo additions and the exact supplied map passed integrity checks.

Tools used for verification run outside the site folder and are not included in the project.

## Maintenance

Edit the HTML directly; no generation script is required to run this site. When changing a menu category ID, update its tag links on Dining Spots. When changing a comparison price, recalculate the matching per-100-ml row. Keep the source-confirmation notes until the relevant price-list evidence is available.

Bootstrap and font licenses remain in `vendor/`. Existing campus photographs and site content come from the supplied project; the map and favicon were supplied for this revision. `.gitignore` excludes operating-system metadata. GitHub Pages serves the repository root from `main`. Updates to that branch trigger the existing Pages build and deployment workflow; no package installation or build command is required.
