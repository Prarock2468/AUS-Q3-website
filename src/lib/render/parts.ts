import type { Author, CaseStudy, Insight, Media, SiteSetting } from '@/payload-types'
import { ARROW_ICON, attr, esc } from '../html'

/* ---------------------------------------------------------------------------------------------------------------
 * Media
 * ------------------------------------------------------------------------------------------------------------- */

export const media = (m: unknown): Media | null => (m && typeof m === 'object' ? (m as Media) : null)
export const mediaUrl = (m: unknown, fallback = '') => media(m)?.url || fallback
export const mediaSizeUrl = (m: unknown, size: 'w800') => media(m)?.sizes?.[size]?.url || ''

export const author = (a: unknown): Author | null => (a && typeof a === 'object' ? (a as Author) : null)

/* ---------------------------------------------------------------------------------------------------------------
 * Cards
 * ------------------------------------------------------------------------------------------------------------- */

export function caseStudyTile(cs: CaseStudy, opts: { priority?: boolean } = {}) {
  const img = mediaUrl(cs.cardImage) || mediaUrl(cs.heroImage)
  const load = opts.priority ? ' fetchpriority="high"' : ' loading="lazy"'
  return `<a class="cs-tile" href="/case-studies/${esc(cs.slug)}" data-tags="${esc((cs.filters || []).join(' '))}">
  <div class="cs-tile-media"><img src="${esc(img)}" alt="" width="960" height="720"${load} decoding="async"><span class="cs-tile-tag">${esc(cs.cardTag)}</span></div>
  <div class="cs-tile-body">
    <h4 aria-level="3">${esc(cs.cardTitle)}</h4>
    <span class="btn btn-outline cs-tile-btn">View Case Study ${ARROW_ICON}</span>
  </div>
</a>`
}

const byline = (a: Author | null, size = 34) =>
  a
    ? `<p class="blog-by"><img class="blog-ini" src="${esc(mediaUrl(a.photo))}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async"><span><strong>${esc(a.name)}</strong> <em>${esc(a.role)}</em></span></p>`
    : ''

export function blogCard(post: Insight, opts: { filterData?: string; priority?: boolean } = {}) {
  const href = `/insights/${esc(post.slug)}`
  const img = mediaUrl(post.cardImage) || mediaUrl(post.coverImage)
  const load = opts.priority ? ' fetchpriority="high"' : ' loading="lazy"'
  return `<article class="blog-card"${opts.filterData || ''}>
  <a class="blog-img" href="${href}" tabindex="-1" aria-hidden="true"><img src="${esc(img)}" alt="" width="768" height="538"${load} decoding="async"></a>
  <span class="blog-tags"><span class="blog-tag">${esc(post.category)}</span><span class="blog-time">${esc(post.readTime)}</span></span>
  <h3><a href="${href}">${esc(post.title)}</a></h3>
  ${byline(author(post.author))}
</article>`
}

/* ---------------------------------------------------------------------------------------------------------------
 * Contact band with the enquiry form (submitted by /js/common.min.js to /forms/enquiry)
 * ------------------------------------------------------------------------------------------------------------- */

export function contactBand(b: { heading?: string | null; text?: string | null; thanksText?: string | null; anchorId?: string | null }) {
  return `<section class="contact-band"${attr('id', b.anchorId)}><div class="wrap">
  <div class="cta-text"><h2>${esc(b.heading)}</h2>${b.text ? `<p>${esc(b.text)}</p>` : ''}</div>
  <div class="lead-card cta-form">
    <form id="cta-form" data-q3-form novalidate>
      <input class="hp" type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <input type="hidden" name="area" value="Share your project idea">
      <div class="lf"><label for="cta-name" data-label="name">Name*</label><input id="cta-name" name="name" type="text" placeholder="Enter name" autocomplete="name" required></div>
      <div class="lf"><label for="cta-email" data-label="email">E-mail*</label><input id="cta-email" name="email" type="email" placeholder="Enter email" autocomplete="email" required></div>
      <div class="lf-row">
      <div class="lf"><label for="cta-phone" data-label="mobile number">Mobile number*</label><input id="cta-phone" name="phone" type="tel" placeholder="Enter mobile number" autocomplete="tel" inputmode="tel" pattern="[0-9 +\\-]{8,20}" required></div>
      <div class="lf"><label for="cta-company" data-label="company name">Company name*</label><input id="cta-company" name="company" type="text" placeholder="Enter company name" autocomplete="organization" required></div>
      </div>
      <div class="lf"><label for="cta-msg" data-label="message">Message*</label><textarea id="cta-msg" name="message" rows="3" placeholder="Enter message" required></textarea></div>
      <div class="lead-submit">
        <div class="captcha lf"><label for="cta-cap" data-label="answer"><span class="cap-q" data-captcha-q>2 + 3 =</span></label><input id="cta-cap" name="captcha" type="text" inputmode="numeric" autocomplete="off" maxlength="3" placeholder="?" data-captcha required aria-label="Security question: what is the sum?"></div>
        <button class="btn btn-primary lead-send" type="submit">Submit</button>
      </div>
      <p class="lead-legal">By submitting, you agree to our <a href="https://www.q3tech.com/privacy-policy/" rel="noopener">Privacy Policy</a> and <a href="https://www.q3tech.com/cookies-policy/" rel="noopener">Cookie Policy</a>. We will never share your information with third parties.</p>
    </form>
    <div class="form-done" tabindex="-1" hidden><h3>Thanks, we’ve received your enquiry</h3><p>${esc(b.thanksText || 'Our Australian team will reply within 4 business hours (AEST).')}</p></div>
  </div>
</div></section>`
}

/* ---------------------------------------------------------------------------------------------------------------
 * "Schedule a call" card next to FAQs
 * ------------------------------------------------------------------------------------------------------------- */

const CALENDAR_ICON =
  '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'

export function salesCard(s: SiteSetting) {
  if (!s.salesName) return ''
  return `<div class="faq-cta"><h3>Can’t find your answer?</h3><p>Schedule a call with our sales expert</p>
<div class="book-call-row">
<div class="book-call">
<span class="book-call-ph"><img src="${esc(s.salesPhoto)}" alt="" width="56" height="56" loading="lazy" decoding="async"></span>
<span class="book-call-txt">
<span class="book-call-title">${esc(s.salesName)}</span>
<span class="book-call-sub">${esc(s.salesRole)}</span>
</span>
</div>
<a class="btn btn-primary book-call-btn" href="/contact" data-open-lead data-cta="schedule_call" data-tip="Schedule a Call" aria-label="Schedule a Call">${CALENDAR_ICON} Schedule a Call</a>
</div></div>`
}
