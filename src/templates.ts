/**
 * Page templates carried over from the original static site. Each template decides the class on <html>, which
 * stylesheets and scripts load (in the original order), and which floating extras sit after the footer.
 *
 * The stylesheets and scripts live unchanged in /public/css and /public/js.
 */
export type TemplateName =
  | 'home'
  | 'main'
  | 'caseStudy'
  | 'insight'
  | 'search'
  | 'about'
  | 'ourWork'
  | 'industries'
  | 'industryDetail'
  | 'services'
  | 'service'
  | 'notFound'

export type Template = {
  label: string
  htmlClass: string
  css: string[]
  js: string[]
  /** Run the short "sr-wait" script that hides scroll-reveal content until the scripts load. */
  srWait: boolean
  /** Which extras follow the footer: the lead dialog + cookie banner set, or just the "Talk to our agent" button. */
  extras: 'full' | 'simple' | 'none'
  /** Service pages place the footer inside <main class="page">. */
  footerInMain?: boolean
}

const CORE_CSS_BEFORE = ['/css/base.min.css']
const CORE_CSS_AFTER = ['/css/common.min.css', '/css/header.min.css', '/css/header-menu.css']
const FOOTER_CSS = ['/css/footer.min.css']

const css = (...templateFiles: string[]) => [...CORE_CSS_BEFORE, ...templateFiles, ...CORE_CSS_AFTER, ...FOOTER_CSS]

export const TEMPLATES: Record<TemplateName, Template> = {
  home: {
    label: 'Home',
    htmlClass: 't-main',
    css: css('/css/templates/main.min.css'),
    js: ['/js/vendor/gsap.min.js', '/js/header.min.js', '/js/templates/main.min.js', '/js/common.min.js'],
    srWait: false,
    extras: 'full',
  },
  main: {
    label: 'Standard (lists, contact)',
    htmlClass: 't-main',
    css: css('/css/templates/main.min.css'),
    js: ['/js/vendor/gsap.min.js', '/js/header.min.js', '/js/templates/main.min.js', '/js/common.min.js'],
    srWait: true,
    extras: 'full',
  },
  insight: {
    label: 'Insight article',
    htmlClass: 't-main',
    css: css('/css/templates/main.min.css'),
    js: ['/js/vendor/gsap.min.js', '/js/header.min.js', '/js/templates/main.min.js', '/js/common.min.js'],
    srWait: true,
    extras: 'full',
  },
  caseStudy: {
    label: 'Case study',
    htmlClass: 't-main t-csd',
    css: css('/css/templates/main.min.css', '/css/templates/case-study.min.css'),
    js: [
      '/js/vendor/gsap.min.js',
      '/js/header.min.js',
      '/js/templates/main.min.js',
      '/js/templates/case-study.min.js',
      '/js/common.min.js',
    ],
    srWait: true,
    extras: 'full',
  },
  industryDetail: {
    label: 'Industry detail',
    htmlClass: 't-main t-idet',
    css: css('/css/templates/main.min.css', '/css/templates/industry-detail.min.css'),
    js: [
      '/js/vendor/gsap.min.js',
      '/js/header.min.js',
      '/js/templates/main.min.js',
      '/js/templates/industry-detail.min.js',
      '/js/common.min.js',
    ],
    srWait: true,
    extras: 'full',
  },
  search: {
    label: 'Search results',
    htmlClass: 't-main',
    css: [
      ...CORE_CSS_BEFORE,
      '/css/templates/main.min.css',
      ...CORE_CSS_AFTER,
      '/css/templates/search.min.css',
      ...FOOTER_CSS,
    ],
    js: ['/js/header.min.js', '/js/search-index.js', '/js/templates/search.min.js', '/js/common.min.js'],
    srWait: true,
    extras: 'simple',
  },
  about: {
    label: 'About',
    htmlClass: 't-about',
    css: css('/css/templates/about.min.css'),
    js: ['/js/header.min.js', '/js/templates/about.min.js', '/js/common.min.js'],
    srWait: true,
    extras: 'simple',
  },
  ourWork: {
    label: 'Our Work (clients, testimonials, UI/UX work)',
    htmlClass: 't-about',
    css: [
      ...CORE_CSS_BEFORE,
      '/css/templates/about.min.css',
      ...CORE_CSS_AFTER,
      '/css/templates/our-work.min.css',
      ...FOOTER_CSS,
    ],
    js: ['/js/header.min.js', '/js/vendor/gsap.min.js', '/js/templates/our-work.min.js', '/js/common.min.js'],
    srWait: true,
    extras: 'simple',
  },
  industries: {
    label: 'Industries overview',
    htmlClass: 't-ind',
    css: css('/css/templates/industries.min.css'),
    js: ['/js/header.min.js', '/js/templates/industries.min.js', '/js/common.min.js'],
    srWait: true,
    extras: 'simple',
  },
  services: {
    label: 'Services overview',
    htmlClass: 't-svcs',
    css: css('/css/templates/services.min.css'),
    js: ['/js/header.min.js', '/js/templates/services.min.js', '/js/common.min.js'],
    srWait: true,
    extras: 'simple',
  },
  service: {
    label: 'Service page',
    htmlClass: 't-svc',
    css: css('/css/templates/service.min.css'),
    js: ['/js/vendor/lenis.min.js', '/js/header.min.js', '/js/templates/service.min.js', '/js/common.min.js'],
    srWait: true,
    extras: 'simple',
    footerInMain: true,
  },
  notFound: {
    label: 'Not found',
    htmlClass: 't-main',
    css: css('/css/templates/main.min.css'),
    js: ['/js/header.min.js', '/js/common.min.js'],
    srWait: false,
    extras: 'simple',
  },
}

/** Templates editors can pick for a page (case studies and insights have their own collections). */
export const PAGE_TEMPLATE_OPTIONS = (Object.keys(TEMPLATES) as TemplateName[])
  .filter((t) => !['caseStudy', 'insight', 'notFound'].includes(t))
  .map((value) => ({ label: TEMPLATES[value].label, value }))

/** Bumped on every deploy so browsers fetch the latest CSS and JS. */
export const ASSET_VERSION = process.env.NEXT_PUBLIC_ASSET_VERSION || '4'
