/**
 * HTML for the common components (client logos, testimonial slider, case studies slider), plus the helpers that pick
 * which testimonials and case studies a slider shows. Used both when the
 * section sits directly in a page (page-specific content) and when a page points at a saved Common Component entry.
 * The markup and class names match the original site, so the existing CSS and slider scripts drive them.
 */
import { cache } from 'react'
import { TESTIMONIALS_ENTRY_KEY } from '@/blocks/common/Testimonials'
import type {
  CaseStudiesSliderBlock,
  ClientLogosBlock,
  CommonComponent,
  TestimonialSliderBlock,
  TestimonialsBlock,
} from '@/payload-types'
import { getCaseStudies, getPayloadClient } from '../data'
import { ARROW_ICON, esc } from '../html'
import { media } from './parts'

const PREV_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'
const NEXT_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

/** Adds an id to the opening <section> tag, for in-page links. */
export const withAnchor = (html: string, anchorId?: string | null) =>
  anchorId ? html.replace(/^(\s*<section\b)(?![^>]*\bid=)/, `$1 id="${esc(anchorId)}"`) : html

export function renderClientLogos(block: ClientLogosBlock): string {
  const logos = (block.logos || []).flatMap((l) => {
    const m = media(l.logo)
    return m?.url ? [{ name: l.name, url: l.url, src: m.url }] : []
  })
  if (!logos.length) return ''

  // The list is rendered twice (second copy hidden from screen readers) so the CSS marquee loops seamlessly.
  const item = (l: (typeof logos)[number], copy: boolean) => {
    const img = `<img src="${esc(l.src)}" alt="${esc(l.name)}" width="150" height="40" loading="lazy" decoding="async">`
    return `<li${copy ? ' aria-hidden="true"' : ''}>${l.url && !copy ? `<a href="${esc(l.url)}">${img}</a>` : img}</li>`
  }

  return `<section class="brands" aria-label="Clients">
  <div class="wrap"><p class="brands-title">${esc(block.heading || 'Trusted By Global Brands')}</p></div>
  <div class="brand-marquee"><ul class="brand-track">${logos.map((l) => item(l, false)).join('')}${logos.map((l) => item(l, true)).join('')}</ul></div>
</section>`
}

/** The Testimonial slider in Common Component → Testimonial Slider: the list every Testimonials section picks from. */
const getTestimonialsSlider = cache(async (): Promise<TestimonialSliderBlock | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'commonComponent',
    where: { key: { equals: TESTIMONIALS_ENTRY_KEY } },
    depth: 2,
    limit: 1,
  })
  return (docs[0]?.layout?.find((s) => s.blockType === 'testimonialSlider') as TestimonialSliderBlock | undefined) || null
})

/**
 * A "Testimonials" page section: the testimonials it picked from Common Component → Testimonial Slider, in the
 * picked order (all of them when it picked none, or none of its picks still exist), with the saved slider's layout.
 */
export async function renderTestimonials(block: TestimonialsBlock): Promise<string> {
  const slider = await getTestimonialsSlider()
  if (!slider) return ''
  const all = slider.testimonials || []
  const picked = (block.testimonials || []).flatMap((id) => all.filter((t) => t.id === id))
  const html = await renderTestimonialSlider({
    ...slider,
    heading: block.heading || slider.heading,
    testimonials: picked.length ? picked : all,
  })
  return withAnchor(html, block.anchorId)
}

export async function renderTestimonialSlider(block: TestimonialSliderBlock): Promise<string> {
  const items = block.testimonials || []
  if (!items.length) return ''

  const cards = items
    .map((t, i) => {
      const photo = media(t.photo)
      const logo = media(t.companyLogo)
      // The empty last paragraph is needed: on phones the CSS hides each quote's last paragraph.
      const paragraphs =
        t.quote
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => `<p>${esc(p)}</p>`)
          .join('') + '<p>&#8203;</p>'
      const role = [t.role, t.company].filter(Boolean).join(', ')
      const photoHtml =
        t.photoHtml ||
        (photo?.url
          ? `<img decoding="async" loading="lazy" class="tphoto__img" src="${esc(photo.url)}" width="${photo.width || 480}" height="${photo.height || 612}" alt="">`
          : '')
      return `<div class="tcard${i === 0 ? ' is-active' : ''}">
          <div class="tphoto">${photoHtml}</div>
          <div class="tbody">
            <img decoding="async" loading="lazy" class="tbody__quote" src="/assets/icons/common/testi-quote.svg" width="50" height="37" alt="">
            <div class="tbody__text">${paragraphs}</div>
            <div class="tbody__who">
              <div class="tbody__attr">
                <p class="tbody__name">${esc(t.name)}</p>${role ? `<p class="tbody__role">${esc(role)}</p>` : ''}
              </div>${logo?.url ? `<img decoding="async" loading="lazy" class="tbody__logo" src="${esc(logo.url)}" width="${logo.width || 163}" height="${logo.height || 51}" alt="${esc(t.company || '')}">` : ''}
            </div>
          </div>
        </div>`
    })
    .join('')

  const nav =
    items.length < 2
      ? ''
      : `<div class="testi__nav">
      <div class="testi__dots">${items
        .map(
          (_, i) =>
            `<button class="testi__dot${i === 0 ? ' is-active' : ''}" type="button" aria-pressed="${i === 0}" aria-label="Show testimonial ${i + 1}"></button>`,
        )
        .join('')}</div>
      <div class="testi__arrows">
        <button class="testi__arrow" type="button" data-testi-prev aria-label="Previous testimonial">${PREV_ICON}</button>
        <button class="testi__arrow" type="button" data-testi-next aria-label="Next testimonial">${NEXT_ICON}</button>
      </div>
    </div>`

  return `<section class="testi" aria-labelledby="testi-title">
  <div class="testi__inner">
    <h2 id="testi-title">${esc(block.heading || 'Testimonials')}</h2>
    <div class="testi__viewport">
      <div class="testi__track" data-carousel="testimonials">${cards}</div>
    </div>
    ${nav}
  </div>
</section>`
}

/**
 * The case studies a Case studies slider shows. Only published ones: in the order picked in the CMS, or, when none
 * are picked, the first `limit` in list order. Shared by this HTML renderer and the <CaseStudiesSlider> component.
 */
export async function caseStudiesForSlider(block: Pick<CaseStudiesSliderBlock, 'caseStudies' | 'limit'>) {
  const published = await getCaseStudies()
  const picked = (block.caseStudies || [])
    .map((c) => published.find((p) => p.id === (typeof c === 'object' ? c?.id : c)))
    .filter((c): c is (typeof published)[number] => Boolean(c))
  return picked.length ? picked : published.slice(0, block.limit || 6)
}

export async function renderCaseStudiesSlider(block: CaseStudiesSliderBlock): Promise<string> {
  const studies = await caseStudiesForSlider(block)
  if (!studies.length) return ''

  const cards = studies
    .map((cs) => {
      const img = media(cs.cardImage) || media(cs.heroImage)
      const stats = (cs.outcome?.stats || [])
        .slice(0, 2)
        .map(
          (s) =>
            `<div class="cs-story-stat"><span class="cs-stat-v">${esc(s.value)}</span><span class="cs-stat-l">${esc(s.label)}</span></div>`,
        )
        .join('')
      return `<article class="cs-story" aria-label="${esc(cs.cardTag || cs.cardTitle)}">
  <div class="cs-story-media">
    ${cs.cardTag ? `<p class="cs-story-cat">${esc(cs.cardTag)}</p>` : ''}
    ${img?.url ? `<img class="cs-story-fill" src="${esc(img.url)}" alt="" width="${img.width || 768}" height="${img.height || 576}" loading="lazy" decoding="async">` : ''}
    <span class="cs-story-overlay" aria-hidden="true"></span>
  </div>
  <div class="cs-story-content">
    <p class="cs-story-headline">${esc(cs.cardTitle)}</p>
    <div class="cs-story-bottom">
      ${stats ? `<div class="cs-story-stats">${stats}</div>` : ''}
      <a class="btn btn-outline cs-story-link" href="/case-studies/${esc(cs.slug)}">Read Story ${ARROW_ICON}</a>
    </div>
  </div>
</article>`
    })
    .join('')

  const viewAll = block.viewAllLink
    ? `<a class="btn btn-outline cs-story-all" href="${esc(block.viewAllLink)}">${esc(block.viewAllLabel || 'View All')} ${ARROW_ICON}</a>`
    : ''

  return `<section class="cs-story-sec" aria-labelledby="cs-story-title"><div class="wrap">
  <div class="cs-story-head">
    <h2 id="cs-story-title">${esc(block.heading || 'Case Studies')}</h2>
    <div class="cs-story-actions">
      ${viewAll}
      <div class="cs-arrows">
        <button type="button" class="blog-arrow" data-tq-prev aria-label="Previous case study">${PREV_ICON}</button>
        <button type="button" class="blog-arrow" data-tq-next aria-label="Next case study">${NEXT_ICON}</button>
      </div>
    </div>
  </div>
</div>
  <div class="tq-row cs-story-row" data-tq-row${block.autoplay === false ? '' : ' data-tq-autoplay="6000"'} data-tq-start="1">${cards}</div>
</section>`
}

/** HTML for one common component section, or null when the section is not one of the three. */
export async function renderCommonSection(block: { blockType: string }): Promise<string | null> {
  switch (block.blockType) {
    case 'clientLogos':
      return renderClientLogos(block as ClientLogosBlock)
    case 'testimonialSlider':
      return renderTestimonialSlider(block as TestimonialSliderBlock)
    case 'testimonials':
      return renderTestimonials(block as TestimonialsBlock)
    case 'caseStudiesSlider':
      return renderCaseStudiesSlider(block as CaseStudiesSliderBlock)
    default:
      return null
  }
}

/** Loads a saved Common Component entry (by id or populated doc) with its images, ready to render. */
export async function loadCommonComponent(
  ref: number | CommonComponent | null | undefined,
): Promise<CommonComponent | null> {
  const id = typeof ref === 'object' ? ref?.id : ref
  if (!id) return null
  const payload = await getPayloadClient()
  try {
    return await payload.findByID({ collection: 'commonComponent', id, depth: 2 })
  } catch {
    return null
  }
}
