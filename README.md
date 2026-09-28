# AITU Eateries — Assignment 3, Tasks 1–5

Team: Anarbekov Ramazan and Makhymetov Amir · SE-2504

## Open the project

Open `index.html` in a browser. No installation or build step is needed.
Bootstrap 5.3.8, fonts, and images are included locally, so the project works offline.

- `index.html`: Bootstrap home page, with the two-column and three-column sections.
- `media-queries.html`: Tasks 1–2, with no Bootstrap dependency. Reach it from the home page or any footer.
- `eateries.html`, `menu.html`, `contact.html`: existing content adapted to Bootstrap layouts, spacing, and navigation.

For a local server, run this command inside the project folder, then visit http://localhost:8000:

```sh
python3 -m http.server 8000
```

## Task 1 — Responsive typography

`css/typography.css` starts with mobile font sizes, then uses two explicit media queries:

| Viewport width  | Heading 1 | Heading 2 | Heading 3 | Body paragraphs |
| --------------- | --------- | --------- | --------- | --------------- |
| Below 768px     | 2rem      | 1.5rem    | 1.125rem  | 1rem            |
| 768–991px       | 2.5rem    | 1.875rem  | 1.25rem   | 1.0625rem       |
| 992px and above | 3rem      | 2rem      | 1.375rem  | 1.125rem        |

The `min-width` queries build on the mobile defaults. Headings and card paragraphs on `media-queries.html` visibly grow at each breakpoint. Small labels and footer text have their own sizes.

## Task 2 — CSS-only card group

`media-queries.html` contains exactly three cards. `css/media-queries.css` uses CSS Grid and media queries:

```css
/* Mobile default */
.mq-card-group {
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 768px) {
  .mq-card-group {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 992px) {
  .mq-card-group {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

On tablets the third card begins a new row and keeps the same width as the other cards. This page loads only the fonts, typography stylesheet, and its own CSS. Its custom spacing is required by Part 1's CSS-only approach.

## Task 3 — Bootstrap grid

On `index.html`:

- The hero uses a `.container`, a `.row`, and two `col-12 col-lg-6` columns. On desktop, 6 + 6 fills Bootstrap's 12-column grid.
- “Why check here first” uses three `col-12 col-md-6 col-lg-4` columns. They stack on phones, form two columns on tablets, and form three columns on desktop.

The other pages also use Bootstrap containers, rows, and columns. Examples include the menu's `col-lg-3` sidebar and `col-lg-9` main content, the dining and team sections, and the gallery's `col-12 col-sm-6 col-lg-4` columns.

## Task 4 — Bootstrap spacing

All four Bootstrap pages express layout spacing in HTML with Bootstrap utilities. The shared `style.css` and `typography.css` contain no custom margin, padding, or gap declarations.

Examples:

- `py-4 py-lg-5`: more vertical section padding on desktop.
- `p-3 p-sm-4`: more space inside dining and team panels from the small breakpoint.
- `mt-lg-4`: additional desktop top margin on the hero heading.
- `mt-3 mt-lg-0`: space above the collapsed navigation links, removed on desktop.
- `g-4 g-lg-5`: responsive row gutters.
- `gap-2`, `mb-3`, `me-2`, `px-3`, `py-2`: consistent element spacing.

Part 1's separate CSS-only page intentionally keeps custom CSS spacing, as Task 2 prohibits Bootstrap there.

## Task 5 — Bootstrap navbar

All four main pages share a Bootstrap navbar with Home, Dining Spots, Menu, and Contact links.

- `navbar navbar-expand-lg`: hamburger navigation below 992px; expanded links at 992px and above.
- `bg-white`, `link-success`, `text-success`, and `fw-bold`: background and link styling.
- A `navbar-toggler` button uses `data-bs-toggle="collapse"` and `data-bs-target="#main-nav"` to control the `collapse navbar-collapse` element.
- The local Bootstrap bundle provides the collapse behavior and updates `aria-expanded`.
- `aria-current="page"` identifies the current page.

## Verification

Checked all five pages in a browser at 320, 375, 767, 768, 991, 992, and 1280px:

- No page-level horizontal overflow.
- Correct one/two/three-column behavior on the CSS-only page.
- Correct two-column hero and three-column feature section on desktop.
- Responsive heading and paragraph sizes.
- Hamburger opens and closes on all four Bootstrap pages; all four links remain available.
- Local file links, fragment links, image paths, unique IDs, and preserved menu/hour data checked.
- Bootstrap files match the SHA-384 checksums published in the official documentation.

The contact form remains the original static form without a message-delivery backend.

## References and dependencies

- [Bootstrap introduction](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Bootstrap grid](https://getbootstrap.com/docs/5.3/layout/grid/)
- [Bootstrap spacing](https://getbootstrap.com/docs/5.3/utilities/spacing/)
- [Bootstrap navbar](https://getbootstrap.com/docs/5.3/components/navbar/)

Bootstrap's MIT license is in `vendor/bootstrap/LICENSE`. Font licenses are in `vendor/fonts/`. Existing photos and site content come from the supplied project.
