# AITU Eateries

A student guide to Cafeteria, Coffee Lake, Sheker and Mokko at Astana IT University. The website brings together campus locations, opening hours, menus, photographs and a coffee planner.

**Team:** Ramazan Anarbekov and Amir Makhymetov, SE-2504.

**Website:** [AITU Eateries on GitHub Pages](https://selamali.github.io/AITU-Eateries/)

**Repository:** [Selamali/AITU-Eateries](https://github.com/Selamali/AITU-Eateries)

## Pages and responsibilities

| Page | Content | Author |
| --- | --- | --- |
| `index.html` | Introduction, animated statistics and useful links | Ramazan Anarbekov |
| `map.html` | Interactive first-floor dining map | Ramazan Anarbekov |
| `eateries.html` | Dining cards, opening hours and interactive photo gallery | Ramazan Anarbekov |
| `menu.html` | Four menus, live search, autocomplete, Coffee Planner and subscription dialog | Amir Makhymetov |
| `contact.html` | Team information, contact form, registration dialog and clipboard button | Amir Makhymetov |
| `faq.html` | Searchable dining questions with expandable answers and highlighted matches | Ramazan Anarbekov |

## Technologies

- HTML5 for page structure, tables and forms.
- CSS3 and Bootstrap for styling, responsive layouts and components.
- JavaScript for DOM manipulation, events, validation and the Coffee Planner.
- jQuery for live filtering, effects, animations and interface feedback.
- Three.js 0.180.0, OrbitControls and SVGLoader for the map; loaded locally on `map.html` only.

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

No build step or package installation is required. Bootstrap CSS, fonts, images and audio are included in the project. jQuery 4.0.0 and its MIT license are included locally in `vendor/jquery/`. Use localhost or HTTPS for clipboard functionality; browser permissions may still affect copying.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Home page |
| `eateries.html` | Dining Spots page |
| `menu.html` | Menu page |
| `contact.html` | Contact page |
| `faq.html` | Searchable frequently asked questions |
| `map.html` | Full-screen interactive first-floor map |
| `css/style.css` | Shared themes, typography, components and responsive layouts |
| `js/site.js` | Theme, navigation, 3D map, gallery, search, effects, forms, Coffee Planner and budget equivalents |
| `images/` | Logo, map, hero image, dining photos and team portraits |
| `gallery/` | Dining gallery photographs |
| `audio/` | Gallery click sound |
| `favicon/` | Browser and home-screen icons |
| `vendor/bootstrap/` | Bootstrap stylesheet and license |
| `vendor/fonts/` | Local fonts, font declarations and licenses |
| `vendor/jquery/` | Local jQuery 4.0.0 and MIT license |
| `vendor/three/` | Pinned Three.js, compatible addons and MIT license |
| `vendor/aitumap/` | Original floor-plan MIT license |
| `profile.html` | Account details and logout |

## JavaScript features

### First-floor map

`initCampusMap` builds a roofless 3D scene from `images/campus-first-floor.svg`, adapted from the MIT-licensed [Yuujiso/aitumap](https://github.com/Yuujiso/aitumap) plan. Only floor 1, blocks C1.1–C1.3, is included. Wall heights are schematic. Four positions are calibrated from the pin tips in the supplied `images/campus-map.jpg`; the original reference is retained. Drag, wheel/pinch, buttons and contextual keyboard controls operate the camera. Theme changes preserve the view and selection. The map needs WebGL and must be served through HTTP(S).

### Coffee Planner

The planner on the Menu page has three steps: choose a coffee temperature, enter a budget and view matching drinks. It checks that the budget is a positive whole number, filters a predefined array of six drinks and creates result cards with the drink's name, venue, portion, price and remaining budget. Users can go back or restart the planner.

The planner uses selected drinks, not the entire menu. Its data is maintained in `initCoffeePlanner` inside `js/site.js`. Confirmed budgets also show approximate USD/EUR equivalents from ExchangeRate-API; prices, drink selection and money left remain in KZT.

### Gallery and navigation

The Dining Spots gallery supports thumbnails, previous/next buttons and Left/Right arrow keys when a gallery control has focus. Changing a photo updates its caption, counter and menu link, and attempts to play a click sound. The gallery remains usable if audio playback fails.

The main navigation supports Left/Right arrow keys and a mobile disclosure button, with Escape to close. Every page has a Dark mode button; the choice is saved as `aitu.theme`, with the system preference as the default. Other JavaScript features include FAQ expansion on `faq.html` and an Astana clock where its display element is present.

### Forms and dialogs

- **Registration:** the Try registration demo button on Contact opens a registration dialog. Validation checks the name, email, password length and password confirmation, then focuses the first invalid field when needed.
- **Contact:** validates the input locally and immediately, keeping the draft and validation result visible. It does not send a message.
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
| Copy to clipboard | Uses the Clipboard API with jQuery feedback and shows a message when copying fails |
| Lazy-loaded thumbnails | Loads gallery thumbnail sources as they approach the viewport and handles image-loading errors |


`site.js` runs early in the head to apply the saved theme before styling. It initializes page components once the document is ready, after deferred full jQuery has loaded. Layout-changing features use the custom `layoutchange` event to refresh scroll progress, pending images and counters.

## Responsive design and accessibility

Bootstrap containers and columns work with custom Flexbox, Grid and media queries. The menu navigation becomes a sidebar on larger screens. Wide tables have their own scrolling regions on smaller screens. Dining cards reflow into one, two or four columns as space allows.

The project includes semantic HTML, image alternative text, form labels, visible validation messages, keyboard controls and ARIA attributes for interactive elements. Animation styles and counters account for reduced-motion preferences.

## Project data and assets

Menu entries are stored in `menu.html`, while the Coffee Planner uses a separate array in `initCoffeePlanner` inside `js/site.js`. Home statistics are configured in HTML. Menu groups marked **Demo additions** contain illustrative items, and some prices and portions are marked for confirmation.

The project includes local photographs, a campus map, fonts and gallery audio. Bootstrap, jQuery and font licenses are included in `vendor/`.

### Authentication simulation

Users can sign up with a name, email, phone number and password.
Accounts are stored in localStorage for this educational frontend demo.
Login checks the saved credentials and redirects to profile.html.
The profile displays the user's name, email and phone number.
Logout removes the current session.

Use sample passwords only. This is not production authentication.

### Form validation

All forms use novalidate and JavaScript validation.
Validation includes required fields, email format, password length
and complexity, password confirmation and Kazakhstan phone numbers.
Errors appear next to the corresponding fields.

Contact and subscription forms are local demonstrations:
they do not send messages or create real subscriptions.