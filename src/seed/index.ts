/**
 * One-off migration: reads the original static site in legacy/site and fills the CMS.
 *
 *   npm run seed            (wipes Pages, Case studies, Insights, Authors, Media and Redirects first)
 *
 * Structured content (case studies, insights, FAQs, contact bands, shared sections) is parsed into fields.
 * One-off sections (heroes, process timelines, stats …) are kept as "Custom section (HTML)" blocks with their
 * original markup, so the design is identical; they can be converted to structured blocks later, one at a time.
 */
import 'dotenv/config'
import * as cheerio from 'cheerio'
import { JSDOM } from 'jsdom'
import { randomBytes } from 'crypto'
import fs from 'fs'
import { getPayload, type Payload } from 'payload'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '../payload.config'
import { articleEditor, simpleEditor } from '../lexical'
import { cleanPath, listPages, normaliseHtml, publicFile, read } from './legacy'
import { seedIndustries } from './industries'
import { restoreEditedPages } from './backup'

type CheerioAPI = cheerio.CheerioAPI
type El = any

const log = (...a: unknown[]) => console.log('[seed]', ...a)
const ctx = { disableRevalidate: true }

let payload: Payload
let simpleCfg: Awaited<ReturnType<typeof editorConfigFactory.fromEditor>>
let articleCfg: Awaited<ReturnType<typeof editorConfigFactory.fromEditor>>

/* ------------------------------------------------------------------------------------------------------------- */
/* Parsing helpers                                                                                                */
/* ------------------------------------------------------------------------------------------------------------- */

const load = (html: string) => cheerio.load(html, { sourceCodeLocationInfo: true } as any)

/** Original markup of an element, sliced from the source so nothing is re-serialised. */
const rawOf = (src: string, el: El): string => {
  const loc = el.sourceCodeLocation
  return loc ? src.slice(loc.startOffset, loc.endOffset) : ''
}

const text = ($: CheerioAPI, el: El) => $(el).text().replace(/\s+/g, ' ').trim()

const toLexical = (html: string, editor: 'simple' | 'article' = 'simple') => {
  const clean = html.replace(/>\s+</g, '><').trim()
  if (!clean) return null
  return convertHTMLToLexical({ editorConfig: editor === 'article' ? articleCfg : simpleCfg, html: clean, JSDOM }) as any
}

const titleOf = ($: CheerioAPI) => $('title').first().text().trim()
const descOf = ($: CheerioAPI) => $('meta[name="description"]').attr('content')?.trim() || ''
const globalUrlOf = ($: CheerioAPI) => $('link[rel="alternate"][hreflang="en"]').attr('href') || ''

/* ------------------------------------------------------------------------------------------------------------- */
/* Media                                                                                                          */
/* ------------------------------------------------------------------------------------------------------------- */

const uploaded = new Map<string, number | string>()

async function upload(url: string | undefined | null, alt = ''): Promise<number | string | undefined> {
  if (!url) return undefined
  const clean = url.split(/[?#]/)[0]
  if (uploaded.has(clean)) return uploaded.get(clean)
  const file = publicFile(clean)
  if (!fs.existsSync(file)) {
    log('  ! missing image', clean)
    return undefined
  }
  // Name files after their old path (case-studies-ai-eeg-analysis-platform-hero.webp) so they stay recognisable.
  const name = clean
    .replace(/^\/assets\/(images|icons)\//, '')
    .replace(/\//g, '-')
  const data = fs.readFileSync(file)
  const ext = name.split('.').pop()!.toLowerCase()
  const mimetype = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype, name, size: data.length },
    context: ctx,
  })
  uploaded.set(clean, doc.id)
  return doc.id
}

/* ------------------------------------------------------------------------------------------------------------- */
/* Steps                                                                                                          */
/* ------------------------------------------------------------------------------------------------------------- */

async function wipe() {
  for (const collection of ['pages', 'case-studies', 'insights', 'authors', 'redirects', 'media'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, context: ctx, overrideAccess: true })
  }
}

/** Header, footer, shared sections, floating extras, organisation details and extra search entries. */
async function seedSettings() {
  const partial = (name: string) => normaliseHtml(read(`partials/${name}.html`).replaceAll('{{root}}', ''), 'index.html').trim()

  const sectionFrom = (file: string, cls: string) => {
    const src = read(file)
    const $ = load(src)
    const el = $('main > section').filter((_, s) => ($(s).attr('class') || '').split(/\s+/).includes(cls)).get(0)
    return el ? normaliseHtml(rawOf(src, el), file).trim() : ''
  }

  const after = (file: string) => {
    const src = read(file)
    const start = src.indexOf('<!-- @end footer -->')
    const end = src.lastIndexOf('</body>')
    return normaliseHtml(src.slice(start + '<!-- @end footer -->'.length, end), file).trim()
  }

  const idx = load(read('index.html'))
  let org: any = {}
  idx('script[type="application/ld+json"]').each((_, s) => {
    const data = JSON.parse(idx(s).text())
    for (const g of data['@graph'] || [data]) if (g['@type'] === 'Organization') org = g
  })

  // UI/UX Work entries from the old search index (they are not separate pages).
  const sandbox: any = { window: {} }
  new Function('window', read('search-index.js'))(sandbox.window)
  const searchExtras = (sandbox.window.Q3_SEARCH_INDEX as any[])
    .filter((e) => e.type === 'UI/UX Work')
    .map((e) => ({
      title: e.title,
      desc: e.desc,
      url: '/ui-ux-work',
      img: e.img ? normaliseHtml(`src="${e.img}"`, 'js/x.js').slice(5, -1) : '',
      section: e.section,
      type: e.type,
      tag: e.tag,
      keys: e.keys,
    }))

  await payload.updateGlobal({
    slug: 'site-settings',
    context: ctx,
    data: {
      orgName: org.name || 'Q3 Technologies',
      telephone: org.telephone,
      email: org.email,
      sameAs: (org.sameAs || []).map((url: string) => ({ url })),
      defaultOgImage: '/assets/images/og-image.png',
      salesName: 'Rajat Bansal',
      salesRole: 'VP Sales',
      salesPhoto: '/assets/images/rajat-bansal.webp',
      header: partial('header'),
      footer: partial('footer'),
      brands: sectionFrom('index.html', 'brands'),
      testimonials: sectionFrom('index.html', 'testi'),
      caseStudyStories: sectionFrom('index.html', 'cs-story-sec'),
      otherIndustries: sectionFrom('services/managed-it-services.html', 'other-industries'),
      extrasFull: after('case-studies.html'),
      extrasSimple: after('about.html'),
      searchExtras,
    } as any,
  })
  log('site settings ✓')
}

/** Authors, read from the author boxes at the end of each insight. */
async function seedAuthors(files: string[]) {
  const byName = new Map<string, number | string>()
  for (const file of files) {
    const $ = load(read(file))
    const box = $('.ins-author').first()
    const name = box.find('.ins-author-n strong').text().trim()
    if (!name || byName.has(name)) continue
    const photoUrl = normaliseHtml(`src="${box.find('img.blog-ini').attr('src')}"`, file).slice(5, -1)
    const doc = await payload.create({
      collection: 'authors',
      context: ctx,
      data: {
        name,
        role: box.find('.ins-author-n em').text().trim(),
        bio: box.find('> div > p').not('.ins-author-n').first().text().trim(),
        linkedin: box.find('a.ins-author-in').attr('href') || '',
        photo: await upload(photoUrl, name),
      } as any,
    })
    byName.set(name, doc.id)
  }
  log(`authors ✓ ${byName.size}`)
  return byName
}

async function seedCaseStudies() {
  const list = load(read('case-studies.html'))
  const order = list('.cs-grid .cs-tile')
    .map((_, a) => cleanPath(list(a).attr('href')!).split('/').pop()!)
    .get()
  const cards = new Map<string, { tag: string; title: string; filters: string[]; img: string }>()
  list('.cs-grid .cs-tile').each((_, a) => {
    const slug = cleanPath(list(a).attr('href')!).split('/').pop()!
    cards.set(slug, {
      tag: list(a).find('.cs-tile-tag').text().trim(),
      title: list(a).find('h4').text().trim(),
      filters: (list(a).attr('data-tags') || '').split(/\s+/).filter(Boolean),
      img: normaliseHtml(`src="${list(a).find('.cs-tile-media img').attr('src')}"`, 'case-studies.html').slice(5, -1),
    })
  })

  // Summaries for site search
  const sandbox: any = {}
  new Function('window', read('search-index.js'))(sandbox)
  const searchDesc = new Map<string, string>(
    (sandbox.Q3_SEARCH_INDEX as any[]).map((e) => [cleanPath(e.url.replace(/^(\.\.\/)+/, '')), e.desc]),
  )

  const files = fs.readdirSync(`${process.cwd()}/legacy/site/case-studies`).filter((f) => f.endsWith('.html'))
  const ids = new Map<string, number | string>()
  const relatedBySlug = new Map<string, string[]>()

  for (const name of files) {
    const file = `case-studies/${name}`
    const slug = name.replace(/\.html$/, '')
    const src = read(file)
    const $ = load(src)
    const img = (sel: string) => {
      const s = $(sel).first().attr('src')
      return s ? normaliseHtml(`src="${s}"`, file).slice(5, -1) : undefined
    }
    const block = (id: string) => {
      const el = $(`#${id}`).clone()
      el.find('h2').first().remove()
      return el.html() || ''
    }
    const card = cards.get(slug)
    const outcome = $('#outcome')
    relatedBySlug.set(
      slug,
      $('.cs-more .cs-tile')
        .map((_, a) => cleanPath(normaliseHtml(`href="${$(a).attr('href')}"`, file).slice(6, -1)).split('/').pop()!)
        .get(),
    )

    const doc = await payload.create({
      collection: 'case-studies',
      context: ctx,
      draft: false,
      data: {
        _status: 'published',
        slug,
        title: $('.csd-hero h1').text().trim(),
        cardTitle: card?.title || $('.breadcrumb li[aria-current]').text().replace('…', '').trim(),
        summary: searchDesc.get(`/case-studies/${slug}`) || descOf($),
        industry: $('.csd-tags dt:contains("Industry") + dd').text().trim(),
        services: $('.csd-tags dt:contains("Services") + dd').text().trim(),
        cardTag: card?.tag || '',
        filters: card?.filters || [],
        heroImage: await upload(img('.csd-banner img')),
        cardImage: await upload(card?.img),
        overview: toLexical(block('overview')),
        challenge: toLexical(block('challenge')),
        solutions: toLexical(block('solutions')),
        outcome: {
          image: await upload(img('#outcome .csd-card-media img')),
          caption: outcome.find('.csd-card-text').text().trim() || undefined,
          stats: outcome.find('.csd-stats li').map((_, li) => ({ value: $(li).find('.cs-stat-v').text().trim(), label: $(li).find('.cs-stat-l').text().trim() })).get(),
          quote: {
            text: outcome.find('.csd-quote p').text().trim() || undefined,
            attribution: outcome.find('.csd-quote footer').text().trim() || undefined,
          },
          highlights: outcome.find('.csd-tiles li').map((_, li) => ({ text: $(li).text().trim() })).get(),
        },
        technology: $('#technology .csd-tech li')
          .map((_, li) => ({
            name: $(li).text().trim(),
            icon: normaliseHtml(`src="${$(li).find('img').attr('src')}"`, file).slice(5, -1),
          }))
          .get(),
        sortOrder: order.indexOf(slug) >= 0 ? (order.indexOf(slug) + 1) * 10 : 900,
        meta: { title: titleOf($), description: descOf($) },
        seoExtras: { globalUrl: globalUrlOf($) },
      } as any,
    })
    ids.set(slug, doc.id)
  }

  for (const [slug, related] of relatedBySlug) {
    const rel = related.map((s) => ids.get(s)).filter(Boolean)
    if (rel.length) await payload.update({ collection: 'case-studies', id: ids.get(slug)!, data: { related: rel } as any, context: ctx })
  }
  log(`case studies ✓ ${ids.size}`)
}

async function seedInsights(authors: Map<string, number | string>) {
  const list = load(read('insights.html'))
  const meta = new Map<string, { tags: string; svc: string[]; ind: string[]; card: string }>()
  const order: string[] = []
  list('.blog-grid .blog-card').each((_, c) => {
    const href = list(c).find('h3 a').attr('href')!
    const slug = cleanPath(href).split('/').pop()!
    order.push(slug)
    meta.set(slug, {
      tags: list(c).attr('data-tags') || '',
      svc: (list(c).attr('data-svc') || '').split(/\s+/).filter(Boolean),
      ind: (list(c).attr('data-ind') || '').split(/\s+/).filter(Boolean),
      card: normaliseHtml(`src="${list(c).find('.blog-img img').attr('src')}"`, 'insights.html').slice(5, -1),
    })
  })

  const files = fs.readdirSync(`${process.cwd()}/legacy/site/insights`).filter((f) => f.endsWith('.html'))
  const ids = new Map<string, number | string>()
  const relatedBySlug = new Map<string, string[]>()

  for (const name of files) {
    const file = `insights/${name}`
    const slug = name.replace(/\.html$/, '')
    const $ = load(read(file))
    const body = $('article.ins-body').clone()

    // FAQs live in their own field; drop them and their heading from the body.
    const faqDiv = body.children('div.faq').first()
    const faqHeading = faqDiv.prev('h2')
    const faqs = faqDiv
      .find('details')
      .map((_, d) => ({ question: $(d).find('summary').text().trim(), answer: toLexical($(d).children('div').html() || '') }))
      .get()
    const faqHeadingText = faqHeading.text().trim() || 'FAQs'
    faqHeading.remove()
    faqDiv.remove()
    // Tables: unwrap the scrolling wrapper; the renderer adds it back.
    body.find('div.ins-table').each((_, d) => {
      $(d).replaceWith($(d).html() || '')
    })
    body.find('p').each((_, p) => {
      if (!$(p).text().trim() && !$(p).find('img').length) $(p).remove()
    })

    const m = meta.get(slug)
    const cover = normaliseHtml(`src="${$('img.ins-cover').attr('src')}"`, file).slice(5, -1)
    const authorName = $('.ins-by strong').first().text().trim()
    const dateText = $('.ins-meta strong').first().text().trim()
    relatedBySlug.set(
      slug,
      $('.ins-more .blog-card h3 a')
        .map((_, a) => cleanPath(normaliseHtml(`href="${$(a).attr('href')}"`, file).slice(6, -1)).split('/').pop()!)
        .get(),
    )

    const doc = await payload.create({
      collection: 'insights',
      context: ctx,
      draft: false,
      data: {
        _status: 'published',
        slug,
        title: $('.ins-col h1').text().trim(),
        summary: $('.ins-summary > p').not('.ins-sum-head').text().trim(),
        body: toLexical(body.html() || '', 'article'),
        faqHeading: faqHeadingText,
        faqs,
        coverImage: await upload(cover),
        cardImage: m?.card && m.card !== cover ? await upload(m.card) : undefined,
        category: $('.ins-meta .ins-tag').text().trim(),
        readTime: $('.ins-meta span').last().text().trim(),
        topic: m?.tags || '',
        industries: m?.ind || [],
        serviceAreas: m?.svc || [],
        author: authors.get(authorName),
        publishedDate: dateText ? new Date(`${dateText} 12:00 GMT+1000`).toISOString() : new Date().toISOString(),
        sortOrder: order.indexOf(slug) >= 0 ? (order.indexOf(slug) + 1) * 10 : 900,
        meta: { title: titleOf($), description: descOf($) },
        seoExtras: { globalUrl: globalUrlOf($) },
      } as any,
    })
    ids.set(slug, doc.id)
  }

  for (const [slug, related] of relatedBySlug) {
    const rel = related.map((s) => ids.get(s)).filter(Boolean)
    if (rel.length) await payload.update({ collection: 'insights', id: ids.get(slug)!, data: { related: rel } as any, context: ctx })
  }
  log(`insights ✓ ${ids.size}`)
  return ids
}

/** Which template a page used, from its <html> class and stylesheets. */
function templateOf(file: string, $: CheerioAPI) {
  const cls = $('html').attr('class') || ''
  const css = $('link[rel="stylesheet"]').map((_, l) => $(l).attr('href')).get().join(' ')
  if (file === 'index.html') return 'home'
  if (cls.includes('t-idet')) return 'industryDetail'
  if (cls.includes('t-svcs')) return 'services'
  if (cls.includes('t-svc')) return 'service'
  if (cls.includes('t-ind')) return 'industries'
  if (cls.includes('t-about')) return css.includes('our-work') ? 'ourWork' : 'about'
  if (css.includes('search.min.css')) return 'search'
  return 'main'
}

function sectionLabel($: CheerioAPI, el: El, i: number) {
  const s = $(el)
  const heading = s.find('h1, h2').first().text().replace(/\s+/g, ' ').trim()
  const label = s.attr('aria-label') || heading || (s.attr('class') || '').split(' ')[0] || `Section ${i + 1}`
  return label.length > 70 ? `${label.slice(0, 69)}…` : label
}

async function seedPages(insightIds: Map<string, number | string>) {
  const sandbox: any = {}
  new Function('window', read('search-index.js'))(sandbox)
  const search = new Map<string, any>(
    (sandbox.Q3_SEARCH_INDEX as any[]).filter((e) => e.type === 'Pages').map((e) => [cleanPath(e.url.replace(/^(\.\.\/)+/, '')), e]),
  )

  const files = listPages().filter((f) => !f.startsWith('case-studies/') && !f.startsWith('insights/'))
  for (const file of files) {
    // Remove the shared header/footer blocks; they come from Site settings.
    const src = read(file)
      .replace(/<!-- @include header -->[\s\S]*?<!-- @end header -->/, '')
      .replace(/<!-- @include footer -->[\s\S]*?<!-- @end footer -->/, '')
    const $ = load(src)
    const path = cleanPath(file)
    const template = templateOf(file, $)
    const layout: any[] = []

    $('main')
      .children()
      .each((i, el) => {
        const s = $(el)
        const tag = (el as any).tagName
        const classes = (s.attr('class') || '').split(/\s+/)
        const raw = () => normaliseHtml(rawOf(src, el), file).trim()

        if (tag === 'footer') return
        if (classes.includes('contact-band')) {
          layout.push({
            blockType: 'contactBand',
            heading: s.find('.cta-text h2').text().trim(),
            text: s.find('.cta-text p').text().trim(),
            thanksText: s.find('.form-done p').not('.demo-note').first().text().trim(),
            anchorId: s.attr('id'),
          })
          return
        }
        const shared = classes.includes('brands')
          ? 'brands'
          : classes.includes('testi')
            ? 'testimonials'
            : classes.includes('cs-story-sec')
              ? 'caseStudyStories'
              : classes.includes('other-industries')
                ? 'otherIndustries'
                : null
        if (shared) {
          layout.push({ blockType: 'sharedSection', section: shared, anchorId: shared === 'caseStudyStories' ? s.attr('id') : undefined })
          return
        }
        if (s.find('.sticky').length && s.children('.wrap').children('div.faq').length) {
          layout.push({
            blockType: 'faq',
            style: classes.includes('home-faq') ? 'home-faq' : s.find('div.faq.home-faq').length ? 'home' : 'section',
            heading: s.find('.sticky h2').first().text().trim(),
            intro: s.find('.sticky > p').first().text().trim(),
            showSalesContact: s.find('.faq-cta').length > 0,
            items: s
              .find('div.faq details')
              .map((_, d) => ({ question: $(d).find('summary').text().trim(), answer: toLexical($(d).children('div').html() || '') }))
              .get(),
          })
          return
        }
        if (classes.includes('list-sec') && file === 'case-studies.html') {
          layout.push({ blockType: 'caseStudyList', heading: 'All case studies' })
          return
        }
        if (classes.includes('list-sec') && file === 'insights.html') {
          layout.push({ blockType: 'insightList', pageSize: Number(s.find('[data-page-size]').attr('data-page-size')) || 12 })
          return
        }
        if (classes.includes('insights-sec')) {
          layout.push({
            blockType: 'latestInsights',
            heading: s.find('h2').first().text().trim(),
            postSlugs: s.find('.blog-card h3 a').map((_, a) => cleanPath(normaliseHtml(`href="${$(a).attr('href')}"`, file).slice(6, -1)).split('/').pop()).get(),
          })
          return
        }
        layout.push({ blockType: 'htmlSection', label: sectionLabel($, el, i), html: raw() })
      })

    const SHARED_NAMES: Record<string, string> = {
      brands: 'Client logos',
      testimonials: 'Testimonials',
      caseStudyStories: 'Case studies slider',
      otherIndustries: 'Other industries',
    }
    for (const b of layout) {
      // Name each row in the page builder so editors can find sections at a glance.
      b.blockName =
        b.label ||
        (b.blockType === 'sharedSection' && SHARED_NAMES[b.section]) ||
        (b.blockType === 'contactBand' && `Contact form: ${b.heading}`) ||
        (b.blockType === 'faq' && `FAQs (${b.items.length})`) ||
        (b.blockType === 'caseStudyList' && 'All case studies') ||
        (b.blockType === 'insightList' && 'All insights') ||
        (b.blockType === 'latestInsights' && 'Latest insights') ||
        undefined
      if (b.blockType === 'latestInsights') {
        b.posts = (b.postSlugs as string[]).map((slug) => insightIds.get(slug)).filter(Boolean)
        delete b.postSlugs
      }
    }

    const entry = search.get(path)
    const ld: any[] = []
    $('script[type="application/ld+json"]').each((_, s) => {
      const data = JSON.parse($(s).text())
      // FAQPage and Organization are generated automatically; keep anything else.
      for (const g of data['@graph'] || [data]) if (!['FAQPage', 'Organization'].includes(g['@type'])) ld.push(g)
    })

    await payload.create({
      collection: 'pages',
      context: ctx,
      draft: false,
      data: {
        _status: 'published',
        title: entry?.title || titleOf($).replace(/\s*\|\s*Q3 Technologies$/, ''),
        path,
        template,
        bodyClass: $('body').attr('class') || undefined,
        mainClass: $('main').attr('class') || undefined,
        layout,
        searchSection: entry?.section,
        searchDescription: entry?.desc,
        hideFromSearch: !entry,
        meta: { title: titleOf($), description: descOf($) },
        seoExtras: {
          globalUrl: globalUrlOf($),
          structuredData: ld.length ? { '@context': 'https://schema.org', '@graph': ld } : undefined,
        },
      } as any,
    })
    log(`page ${path} (${template}, ${layout.length} sections)`)
  }
}

async function seedRedirects() {
  const pages = await payload.find({ collection: 'pages', where: { path: { equals: '/industries/education' } }, limit: 1 })
  if (pages.docs[0]) {
    await payload.create({
      collection: 'redirects',
      context: ctx,
      data: { from: '/industry-details', to: { type: 'reference', reference: { relationTo: 'pages', value: pages.docs[0].id } } } as any,
    })
  }
  log('redirects ✓')
}

async function seedForm() {
  await payload.delete({ collection: 'forms', where: { title: { equals: 'Project enquiry' } }, context: ctx })
  await payload.create({
    collection: 'forms',
    context: ctx,
    data: {
      title: 'Project enquiry',
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true },
        { blockType: 'email', name: 'email', label: 'Email', required: true },
        { blockType: 'text', name: 'phone', label: 'Phone', required: true },
        { blockType: 'text', name: 'company', label: 'Company', required: true },
        { blockType: 'textarea', name: 'message', label: 'Message', required: true },
      ],
      confirmationType: 'message',
      confirmationMessage: toLexical('<p>Thanks, we’ve received your enquiry. Our Australian team will reply within 4 business hours (AEST).</p>'),
    } as any,
  })
  log('enquiry form ✓')
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@q3tech.com'
  // No shared default password: use the one from .env, or generate a one-off password and print it once.
  const password = process.env.SEED_ADMIN_PASSWORD || randomBytes(12).toString('base64url')
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (!existing.docs.length) {
    await payload.create({ collection: 'users', data: { email, password, name: 'Q3 Admin', role: 'admin' } as any })
    log(`admin user created: ${email} / ${password}  ← change this password after first login`)
  }
}

async function run() {
  payload = await getPayload({ config })
  simpleCfg = await editorConfigFactory.fromEditor({ config: payload.config, editor: simpleEditor })
  articleCfg = await editorConfigFactory.fromEditor({ config: payload.config, editor: articleEditor })

  const insightFiles = listPages().filter((f) => f.startsWith('insights/'))
  log('wiping old content…')
  await wipe()
  await seedSettings()
  const authors = await seedAuthors(insightFiles)
  await seedCaseStudies()
  const insightIds = await seedInsights(authors)
  await seedPages(insightIds)
  await seedIndustries(payload)
  await restoreEditedPages(payload)
  await seedRedirects()
  await seedForm()
  await seedAdmin()
  log(`done. ${uploaded.size} images uploaded.`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
