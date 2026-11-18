# Q3 Technologies site — design system

The rules every page and stylesheet follows. `npm run build` checks them after each build and `npm run check` fails
when one is broken, so read this before adding a page, a section or a component.

## How the CSS is organised

Stylesheets load in this order on every page:

| # | File | Holds |
|---|---|---|
| 1 | `css/base.min.css` | Rules several templates share at the start of their cascade (resets, card and slider layout), scoped with `:where(.t-…)` to the templates that use them |
| 2 | `css/templates/*.min.css` | Layout and sections that exist on one template only |
| 3 | `css/common.min.css` | **Tokens** (`:root`), base elements, and every **shared component** |
| 4 | `css/header.min.css`, `css/footer.min.css` | The site header, mega menus and footer |

Page templates are marked on `<html>`: `t-main` (home, case studies, insights, contact, search), `t-csd` (case study
pages), `t-idet` (industry detail), `t-svc` (service pages), `t-svcs` (Services), `t-ind` (Industries), `t-about`
(About and the Our Work pages).

Only minified files exist: edit `*.min.css` directly, then run `npm run build`.

**Rules**

1. A component used on more than one template lives once, in `common.min.css` (or `base.min.css` when it must sit
   before the template rules). Never copy its rules into a template stylesheet. If it needs to differ on one page, add
   a more specific rule there (`.page .component`), not a copy.
2. Use tokens, not raw values, for colour, corner radius, spacing and type (sections below).
3. Template stylesheets load before `common.min.css`. A shared rule wins over a template rule of the same strength,
   so a template override must be more specific (for example `.btn.wd-viewall`, not `.wd-viewall`).

## Colour

| Token | Use |
|---|---|
| `--color-primary` `#2e4acd` | Brand blue: primary buttons, links, active states, focus rings |
| `--color-primary-dark` / `-light` / `-pale` / `-subtle` | Pressed states, tints, soft backgrounds (hero gradients, icon chips) |
| `--gray-50` … `--gray-950` | Text (`--gray-950` headings, `--gray-600` body, `--gray-400`+ muted) and surfaces (`--gray-50` section backgrounds) |
| `--color-white` / `--color-black` and their `-aNN` alphas | Overlays, glass surfaces, borders on photos |
| `--color-success` / `--color-error` / `--color-warning` (+ `-light`, `-subtle`) | Form feedback only |

- Always `var(--color-primary)` for the brand blue. The old aliases (`--blue`, `--q3-blue`, `--blue-line`, `--q3-denim`)
  are retired.
- Dark and light sections (header, footer, contact band, FAQ) set their own `--bg`, `--fg`, `--line` theme variables.
  Use those inside the section rather than a fixed grey.

## Corner radius

| Token | Value | Use |
|---|---|---|
| `--r-2xs` | 4px | Tiny marks: focus rings on small links, indicator bars |
| `--r-s` | 8px | Small controls: skip link, compact focus outlines |
| `--r-m` | 16px | Small items and anything **inside** a card: logo tiles, icon tiles, card images, testimonial photos |
| `--r-l` | 24px | **Cards** and standalone images; panels on phones |
| `--r-2xl` | 32px | **Large panels**: contact band, Get-in-touch panels, case study panels |
| `--r-3xl` | 48px | Full-width **section shapes** (rounded bottom of a hero) |
| `--r-pill` / `--r-round` | 999px / 50% | Buttons, tags, dots / circular buttons and avatars |
| `--r-blob`, `--r-portrait` | shapes | The two decorative shapes (home "What we do", leadership photos) |

An image inside a padded card keeps its corner parallel to the card: `calc(var(--r-l) - <card padding>)`.
No other radius values.

## Spacing

Everything sits on a **4px grid**: `--space-4`, `-8`, `-12`, `-16`, `-20`, `-24`, `-28`, `-32`, `-36`, `-40`, `-44`,
`-48`, `-56`, `-64`, `-72`, `-80`. Reach for the multiples of 8 first (8, 16, 24, 32, 40, 48, 64, 80); the 4-steps
are for tight UI (icon gaps, pill padding). The old 2px steps (2, 6, 10, 14, 18, 22, 26) are retired.

Use `--gutter` for page side padding and `--section` for vertical section padding; both are set per template and
shrink on small screens. Content width is `--wrap` (1240px). Raw px is only for layout offsets that aren't rhythm
(for example `-78px` to pull a hero under the fixed header).

## Type

One font: `--font-sans` (Google Sans Flex). Two scales, each with a job:

- **Fluid scale, for running text and UI** (scales with the viewport, with a compact set at 1024–1600px):
  `--t-2xs`, `--t-xs`, `--t-sm`, `--t-base`, `--t-md`, `--t-lead`, `--t-lg`, `--t-xl`, `--t-2xl`, `--t-3xl`, `--t-h4`,
  plus heading sizes `--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-statement`. Defined once in `common.min.css`.
- **Fixed scale, for components built to an exact Figma size** (the Our Work pages, service sections):
  `--text-14` … `--text-40`.

Weights: 400 body, 500 headings, titles and buttons. A new component picks one scale and sticks to it.

## Elevation, motion

- Shadows: `--shadow-3` for glass surfaces and soft cards, `--shadow-6` for pills on images, `--shadow-10` for raised panels.
  `--shadow-7`, `--shadow-9` and `--shadow-11` are focus and primary-button glows.
- Motion: durations `--dur-150` … `--dur-1000`, easing `--ease` (default) or `--ease-out-expo` for entrances. Every
  animation has a `prefers-reduced-motion` fallback.

## Shared components

All in `common.min.css` unless noted. Use the class names as they are.

| Component | Classes | Notes |
|---|---|---|
| Primary / outline buttons | `.btn` + `.btn-primary` / `.btn-outline` | 44px pill, 14px medium. Primary darkens to `--color-primary-dark` on hover. On a photo: the glass variant. |
| Hero buttons (image icon) | `.ab-btn`, `.ui-btn--primary`, `.ind-btn--primary`, `.btn--primary`, `.btn--white`, `.btn--ghost`, `.ui-btn--ghost`, `.ind-btn--ghost`, `.btn--outline-white` | Same 44px pill; primary, white, outline and glass looks |
| Slider arrows | `.blog-arrow`, `.testi__arrow`, `.invest__arrow`, `.srp-arrow` | One glass arrow: 48px (40px on phones), → / ← icon, blue on hover, dim when disabled |
| Back to top | `.to-top`, `.sr-top` | Glass, 48px, fixed bottom right |
| Image tag pill | `.cs-tile-tag` (case study cards), `.blog-tags` (insight cards) | White pill, top left of the image (in `main.min.css`) |
| Case study card | `.cs-tile` | 24px card, 16px image, tag on the image, `<h4 aria-level="3">` title (screen readers hear it one level below the section heading), "View Case Study" button (in `main.min.css`) |
| Insight card | `.blog-card` | 24px glass card, tag and read time on the image, author row (in `main.min.css`) |
| Testimonial slider | `.testi`, `.tcard`, `.tphoto`, `.tbody` | One design on every page that has testimonials |
| Card slider | `.invest`, `.icard` | Service and industry cards with hover arrows |
| Breadcrumb | `.breadcrumb` | |
| FAQ | `.faq`, `.home-faq`, `.faq-cta` | |
| Logo strip | `.brands`, `.brand-marquee`, `.brand-track` | "Trusted By Global Brands", 22 logos |
| Contact band and enquiry form | `.contact-band`, `.lead-card`, `.lf-row` | |
| Site search | `dialog#search`, `.search-field`, `.search-go` | Bar under the header; results page `search.html` |

Hover: cards lift 4px with a soft shadow and the image zooms to 1.04 (`.cs-tile`, `.blog-card`).

## Checks

`npm run build` prints `design check: ok` or a list of problems; `npm run check` does the same and exits with an
error. It flags:

- a corner radius that isn't a `--r-*` token
- a retired token (old blue aliases, `--shadow-1`, removed radius sizes, the 2px spacing steps)
- the brand blue written as a raw colour
- new hard-coded font sizes or px spacing, and new rules copied between stylesheets, counted per file against
  `design-baseline.json`

The baseline records what was still left on the day the system was introduced, so only new problems are reported.
After a clean-up that lowers those counts, run `node build.mjs --baseline` to record the new, lower numbers.
