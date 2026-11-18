# Q3 Technologies Australia website

This is the Q3 Technologies Australia website, rebuilt on **Next.js 16** and **Payload CMS 3**. It is migrated from the static HTML site in `../` (also kept in `legacy/site`).

- The public site looks and behaves exactly like the HTML version. All 58 pages were compared side by side at desktop and phone sizes: same text, same page heights and no script errors.
- The marketing team edits everything in the CMS at **/admin**: pages, case studies, insights, FAQs, SEO fields, redirects and enquiry forms.
- Publishing in the CMS updates the live page within seconds. Pages are pre-built as static HTML, so they load fast.

---

## Run it on your computer

You need Node.js 20.9 or newer and PostgreSQL 17 or newer. Install PostgreSQL from postgresql.org, or run `docker compose up -d` to start one in Docker.

Create the database once (in SQL Shell / psql, as the `postgres` user). Docker already does this for you:

```sql
CREATE USER q3 WITH PASSWORD 'q3';
CREATE DATABASE q3 OWNER q3;
```

Then:

```bash
cd q3-nextjs-payload
npm install
cp .env.example .env        # already done if a .env file is present; then set PAYLOAD_SECRET (openssl rand -hex 32)
npm run migrate             # creates the tables from src/migrations
npm run seed                # imports the content and creates the admin user (prints its password)
npm run dev
```

- Website: http://localhost:3000
- CMS: http://localhost:3000/admin
- Login: `admin@q3tech.com` with the password from `SEED_ADMIN_PASSWORD` in `.env`, or the one `npm run seed` printed. Ask an admin if you don't have it, and change it after you first log in.

Uploaded images are kept in `media/` locally. The old SQLite database `q3.db` is no longer used; to try the site without PostgreSQL, set `DATABASE_URL=file:./q3.db` in `.env`.

To start again from the original HTML files, run `npm run seed`. This wipes the pages, case studies, insights, authors, media and redirects, then re-imports them.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` then `npm start` | Production build and server (pre-renders every page) |
| `npm run seed` | Import the original HTML site into the CMS |
| `npm run migrate` | Apply pending database migrations from `src/migrations` |
| `npm run migrate:create <name>` | Create a migration after changing a collection, field or block (commit the files) |
| `npm run migrate:status` | Show which migrations have run |
| `npm run ci` | Migrate, then build. Use as the build command when deploying |
| `npm run generate:types` | Refresh `src/payload-types.ts` after changing a collection |

---

## How it fits together

```
Browser ──▶ Next.js 16 (one app)
             ├─ /                 public pages, pre-rendered from CMS content   src/app/(frontend)/[[...slug]]
             ├─ /admin            Payload CMS admin                            src/app/(payload)
             ├─ /api/*            Payload REST + GraphQL API
             ├─ /forms/enquiry    receives the enquiry forms → CMS (+ optional CRM webhook)
             ├─ /js/search-index.js  site search index, built from the CMS
             ├─ /sitemap.xml, /robots.txt   generated from the CMS
             └─ /preview          shows drafts to logged-in editors
          Payload ──▶ PostgreSQL (local and production)
                  ──▶ media/ folder (local) or S3 / R2 (production)
```

### The design is unchanged on purpose

The original CSS, JavaScript and images are in `public/css`, `public/js` and `public/assets`, unchanged. There are two small edits in `public/js`:

- `common.min.js` now posts forms to `/forms/enquiry`.
- `header.min.js` now uses clean URLs.

Each page renders the same HTML markup and class names as before, then loads the same scripts (GSAP, sliders, filters and so on). `src/templates.ts` decides which stylesheets and scripts each page type loads, in the original order. `DESIGN.md` from the old site is in `legacy/DESIGN.md`.

### Content model (what editors see in /admin)

| In the CMS | What it is | URL |
| --- | --- | --- |
| **Case studies** (22) | Fully structured: hero, filters, overview, challenge, solutions, outcome (image, stats, quote, highlights), technology stack, related case studies | `/case-studies/<slug>` and the Case Studies list |
| **Insights** (14) | Fully structured: article body (headings, lists, tables), quick summary, FAQs, author, category and filters, related articles. The table of contents is built automatically from the H2 headings. | `/insights/<slug>` and the Insights list |
| **Authors** (5) | Name, job title, photo, bio, LinkedIn | used on insights |
| **Pages** (22) | Home, services, industries, about, contact, lists, search. Each page is a stack of sections (see below). | any path, for example `/services/managed-it-services` |
| **Media** | Images and documents with alt text. Each upload is also saved as an 800px version. | |
| **Site settings** | Header, footer, shared sections, sales contact, organisation details, Google Tag Manager ID | |
| **Redirects** | Old URL → new URL, managed by marketing | |
| **Leads → Forms / Form submissions** | Every enquiry from the site, with UTM tags and the page it came from | |

**Page sections (blocks).** Editors can add, remove and reorder these:

- **FAQ**: questions and answers. These also generate FAQPage structured data for Google and AI search.
- **Contact form band**: heading, text and thank-you message, with the enquiry form.
- **Shared section**: client logos, testimonials, case study slider or other industries. These are edited once in Site settings and update on every page that uses them.
- **All case studies grid**, **All insights grid** and **Latest insights slider**: built automatically from the collections.
- **Custom section (HTML)**: the one-off sections from the original site (heroes, process timelines, stats, service lists). They keep their exact markup so the design is identical. Editors can change the text, but should keep the class names.

Phase 2 is to convert the most-edited custom sections into structured blocks, one at a time, starting with the service page hero, the "services" list and the process timeline. Nothing else needs to change for this.

### Editorial workflow

- Every change is saved as a **draft** first, with autosave and full version history. You can also schedule publishing.
- **Roles:**
  - **Editors** can only save drafts.
  - **Reviewers** and **Admins** can publish.
- Click **Live preview** or the eye icon to see a draft on the real site design before publishing.

### SEO and AI search (GEO)

- **Clean URLs.** All old `.html` addresses redirect permanently (308) to the new clean URLs, including `industry-details.html` → `/industries/education`.
- **Per-page SEO fields.** Every page, case study and insight has editable meta title, description and social image (SEO tab). It also has canonical URL, noindex and a link to the matching global-site page (Advanced SEO tab), which outputs the `en-AU` / `en` / `x-default` hreflang tags.
- **Structured data generated automatically.** This covers Organization, BreadcrumbList, BlogPosting (insights), Article (case studies), Service (service pages) and FAQPage (any FAQ). Extra JSON-LD can be added per page.
- **Full HTML for crawlers.** Every page is complete server-rendered HTML, so Google and AI crawlers read it without running JavaScript.
- **Sitemap and robots.txt.** `sitemap.xml` is generated from published content. `robots.txt` only allows indexing when `SITE_ENV=production`, so staging sites stay out of Google.

### Leads and analytics

- **Where enquiries go.** Both enquiry forms (the contact band and the "Share your project idea" pop-up) are saved under **Leads → Form submissions**. If `CRM_WEBHOOK_URL` is set, they are also forwarded to the CRM, for example a HubSpot or Salesforce webhook, Zapier or Make. The old honeypot and sum check stay in place.
- **Analytics.** Add the Google Tag Manager ID in **Site settings → Analytics**, then configure GA4, Microsoft Clarity and the `form_submit` conversion inside GTM. The site's scripts already push `form_submit` events to the data layer.

---

## Deploying (recommended: Vercel + PostgreSQL + S3, all in Sydney)

1. **Database.** Create a PostgreSQL database in Sydney (Neon, Supabase or AWS RDS `ap-southeast-2`).
2. **Media storage.** Create an S3 bucket in `ap-southeast-2` (or a Cloudflare R2 bucket) for uploads.
3. **Environment variables.** Import the repo into Vercel and set the variables from `.env.example`:
   - `DATABASE_URL` = the Postgres connection string
   - `PAYLOAD_SECRET` = run `openssl rand -hex 32`
   - `NEXT_PUBLIC_SITE_URL` = for example `https://www.q3tech.com/en-au`
   - `SITE_ENV` = `production`
   - the `S3_*` variables
4. **Region and build.** In Vercel → Settings → Functions, set the region to **Sydney (syd1)**. In Settings → Build, set the build command to `npm run ci`, so migrations run before each new version goes live.
5. **Import the content.** Run `npm run migrate` and then `npm run seed` once against the production database, from your computer with the production `.env`. Then change the admin password.
6. **Point the domain.** If the site lives at `www.q3tech.com/en-au`, add a rewrite on the main site that forwards `/en-au/*` to this deployment, then set `NEXT_PUBLIC_SITE_URL` to match. Using `q3tech.com.au` is simpler.

**Database changes.** Payload never changes the PostgreSQL schema by itself (`push: false` in `src/payload.config.ts`), so a new database has no tables until `npm run migrate` runs. After changing a collection, field or block, run `npm run migrate:create <name>`, check the generated files into `src/migrations`, and run `npm run migrate` locally. Production applies them on the next deploy via `npm run ci`.

---

## Project map

```
src/
  app/(frontend)/[[...slug]]/   public site: layout picks the template; page renders content (static + ISR)
  app/(payload)/                CMS admin and API (generated by Payload)
  app/forms/enquiry/            enquiry form endpoint
  app/js/search-index.js/       site search index
  app/preview/                  draft preview
  app/sitemap.ts, robots.ts
  collections/                  Pages, CaseStudies, Insights, Authors, Media, Users
  blocks/                       page section blocks
  globals/SiteSettings.ts       header, footer, shared sections, organisation details
  lib/render/                   turns CMS content into the original site's HTML
  lib/seo.ts                    metadata and JSON-LD
  templates.ts                  per-template stylesheets and scripts
  migrations/                   PostgreSQL schema migrations (npm run migrate)
  seed/                         one-off import from legacy/site
public/                         original CSS, JS, fonts and images
legacy/site/                    original HTML pages (seed source)
```
