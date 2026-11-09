# AITU Eateries

A student guide to Cafeteria, Coffee Lake, Sheker and Mokko at Astana IT University. The website brings together campus locations, opening hours, menus, photographs and a coffee planner.

**Team:** Ramazan Anarbekov and Amir Makhymetov, SE-2504.

**Website:** [AITU Eateries on GitHub Pages](https://selamali.github.io/AITU-Eateries/)

**Repository:** [Selamali/AITU-Eateries](https://github.com/Selamali/AITU-Eateries)

## Pages and responsibilities

| Page | Content | Author |
| --- | --- | --- |
| `index.html` | Introduction, animated statistics, useful links and campus map | Ramazan Anarbekov |
| `eateries.html` | Dining cards, opening hours, searchable FAQ and interactive photo gallery | Ramazan Anarbekov |
| `menu.html` | Four menus, live search, autocomplete, Coffee Planner and subscription dialog | Amir Makhymetov |
| `contact.html` | Team information, contact form, registration dialog and clipboard button | Amir Makhymetov |

## Technologies

- HTML5 for page structure, tables and forms.
- CSS3 and Bootstrap for styling, responsive layouts and components.
- JavaScript for DOM manipulation, events, validation and the Coffee Planner.
- jQuery for live filtering, effects, animations and interface feedback.

## Run locally

Extract the project and open a terminal in the folder containing `index.html`.

On macOS or Linux:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows with the Python launcher installed:

```sh
py -m http.server 8000 --bind 127.0.0.1
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser. Stop the server with `Ctrl+C`.

No build step or package installation is required. Bootstrap CSS, fonts, images and audio are included in the project. jQuery is loaded from a CDN, so its features require an internet connection. Use localhost or HTTPS for clipboard functionality; browser permissions may still affect copying.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Home page |
| `eateries.html` | Dining Spots page |
| `menu.html` | Menu page |
| `contact.html` | Contact page |
| `css/style.css` | Shared theme, components and responsive layouts |
| `css/typography.css` | Typography rules |
| `js/site.js` | Background color, FAQ toggles, clock, gallery and keyboard navigation |
| `js/script.js` | jQuery search, highlighting, progress, counters, lazy loading and clipboard feedback |
| `js/forms.js` | Registration, subscription and contact-form behavior |
| `js/coffee-planner.js` | Coffee data, preferences, budget validation and result cards |
| `images/` | Logo, map, hero image, dining photos and team portraits |
| `gallery/` | Dining gallery photographs |
| `audio/` | Gallery click sound |
| `favicon/` | Browser and home-screen icons |
| `vendor/bootstrap/` | Bootstrap stylesheet and license |
| `vendor/fonts/` | Local fonts, font declarations and licenses |

## JavaScript features

### Coffee Planner

The planner on the Menu page has three steps: choose a coffee temperature, enter a budget and view matching drinks. It checks that the budget is a positive whole number, filters a predefined array of six drinks and creates result cards with the drink's name, venue, portion, price and remaining budget. Users can go back or restart the planner.

The planner uses selected drinks, not the entire menu. Its data is maintained separately in `js/coffee-planner.js`.

### Gallery and navigation

The Dining Spots gallery supports thumbnails, previous/next buttons and Left/Right arrow keys when a gallery control has focus. Changing a photo updates its caption, counter and menu link, and attempts to play a click sound. The gallery remains usable if audio playback fails.

The main navigation also supports Left/Right arrow keys. Other JavaScript features include FAQ expansion, a background-color button on Home and an Astana clock where its display element is present.

### Forms and dialogs

- **Registration:** the Login button on Contact opens a registration dialog. Validation checks the name, email, password length and password confirmation, then focuses the first invalid field when needed.
- **Contact:** validates the input, temporarily disables the submit button, displays a spinner and shows a notification after a simulated delay.
- **Subscription:** opens a dialog on Menu and displays a confirmation after valid submission.

All forms are frontend demonstrations. They do not send messages, create accounts or register subscriptions. There is no backend or database, and form data is not saved persistently.

## jQuery features

| Feature | Implementation |
| --- | --- |
| Live menu search | Handles `input`, compares normalized dish names and uses `.toggle()` to show matching rows and categories |
| Autocomplete | Collects unique dish names and displays up to six matching suggestions; selecting one applies the search |
| FAQ search and highlighting | Filters answers and creates `<mark>` elements for matching text without treating the query as HTML or a regular expression |
| Scroll progress | Updates a progress bar according to the current scroll position |
| Animated counters | Uses `.animate()` to count up when the statistics become visible; respects reduced-motion preferences |
| Loading spinner | Disables the Contact submit button while the simulated submission is running |
| Notifications | Uses `.fadeIn()`, `.delay()` and `.fadeOut()` for temporary feedback |
| Copy to clipboard | Uses the Clipboard API with jQuery feedback and shows a message when copying fails |
| Lazy-loaded thumbnails | Loads gallery thumbnail sources as they approach the viewport and handles image-loading errors |

Scripts use `defer` and load in dependency order: jQuery, `site.js`, `script.js`, then page-specific scripts. Layout-changing features use the custom `layoutchange` event to refresh scroll progress, pending images and counters.

## Responsive design and accessibility

Bootstrap containers and columns work with custom Flexbox, Grid and media queries. The menu navigation becomes a sidebar on larger screens. Wide tables and dining-card rows have their own scrolling regions on smaller screens.

The project includes semantic HTML, image alternative text, form labels, visible validation messages, keyboard controls and ARIA attributes for interactive elements. Animation styles and counters account for reduced-motion preferences.

## Project data and assets

Menu entries are stored in `menu.html`, while the Coffee Planner uses a separate array in `js/coffee-planner.js`. Home statistics are configured in HTML. Menu groups marked **Demo additions** contain illustrative items, and some prices and portions are marked for confirmation.

The project includes local photographs, a campus map, fonts and gallery audio. Bootstrap and font licenses are included in `vendor/`.
