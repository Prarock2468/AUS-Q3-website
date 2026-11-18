import type { CaseStudy } from '@/payload-types'
import { getCaseStudies } from '../data'
import { ARROW_ICON, esc, shorten } from '../html'
import { richTextToHTML } from '../richtext'
import { siteUrl } from '../seo'
import { caseStudyTile, contactBand, media, mediaSizeUrl, mediaUrl } from './parts'

const SHARE_ICONS = {
  linkedin:
    '<svg viewBox="10 10 20 20" aria-hidden="true"><path d="M15.0219 13.7002C15.0216 14.4331 14.577 15.0926 13.8977 15.3677C13.2184 15.6429 12.4402 15.4787 11.9299 14.9527C11.4196 14.4266 11.2792 13.6437 11.5749 12.9732C11.8706 12.3026 12.5434 11.8782 13.2759 11.9002C14.2489 11.9294 15.0224 12.7268 15.0219 13.7002ZM15.0759 16.8322H11.4759V28.1002H15.0759V16.8322ZM20.7639 16.8322H17.1819V28.1002H20.7279V22.1872C20.7279 18.8932 25.0209 18.5872 25.0209 22.1872V28.1002H28.5759V20.9632C28.5759 15.4102 22.2219 15.6172 20.7279 18.3442L20.7639 16.8322Z" fill="currentColor"/></svg>',
  facebook:
    '<svg viewBox="10 10 20 20" aria-hidden="true"><path d="M21.8039 21.3471H24.0539L24.9539 17.7471H21.8039V15.9471C21.8039 15.0206 21.8039 14.1471 23.6039 14.1471H24.9539V11.1232C24.6608 11.0842 23.5526 10.9971 22.3825 10.9971C19.9395 10.9971 18.2039 12.4882 18.2039 15.2268V17.7471H15.5039V21.3471H18.2039V28.9971H21.8039V21.3471Z" fill="currentColor"/></svg>',
  x: '<svg viewBox="10 10 20 20" aria-hidden="true"><path d="M25.5839 11.2314H28.5611L22.0568 18.6654L29.7086 28.7814H23.7173L19.0247 22.6461L13.6554 28.7814H10.6764L17.6334 20.8299L10.293 11.2314H16.4364L20.678 16.8393L25.5839 11.2314ZM24.539 26.9994H26.1887L15.54 12.9198H13.7697L24.539 26.9994Z" fill="currentColor"/></svg>',
  copy: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/></svg>',
}

export function shareLinks(url: string, className = 'csd-share') {
  const u = esc(url)
  return `<div class="${className}"><span>Share</span><a data-share="linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">${SHARE_ICONS.linkedin}</a><a data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener" aria-label="Share on Facebook">${SHARE_ICONS.facebook}</a><a data-share="x" href="https://twitter.com/intent/tweet?url=${u}" target="_blank" rel="noopener" aria-label="Share on X">${SHARE_ICONS.x}</a><button type="button" data-copy aria-label="Copy link">${SHARE_ICONS.copy}</button></div>`
}

/** Pick related case studies: the editor's choice, otherwise the ones sharing the most filters. */
async function relatedFor(cs: CaseStudy) {
  const all = await getCaseStudies()
  const picked = (cs.related || []).filter((r): r is CaseStudy => typeof r === 'object' && r !== null)
  if (picked.length) return picked.map((p) => all.find((a) => a.id === p.id) || p)
  const mine = new Set(cs.filters || [])
  return all
    .filter((o) => o.id !== cs.id)
    .map((o) => ({ o, score: (o.filters || []).filter((f) => mine.has(f)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.o)
}

export async function renderCaseStudy(cs: CaseStudy) {
  const url = `${siteUrl()}/case-studies/${cs.slug}`
  const hero = media(cs.heroImage)
  const heroSmall = mediaSizeUrl(cs.heroImage, 'w800')
  const srcset = heroSmall ? ` srcset="${esc(heroSmall)} 800w, ${esc(hero?.url)} 1600w" sizes="(max-width: 800px) 100vw, 1600px"` : ''
  const o = cs.outcome || {}

  const sections: { id: string; title: string; html: string; plain: boolean }[] = []
  if (cs.overview) sections.push({ id: 'overview', title: 'Client Overview', html: richTextToHTML(cs.overview, { listClass: 'csd-list' }), plain: true })
  if (cs.challenge) sections.push({ id: 'challenge', title: 'The Challenge', html: richTextToHTML(cs.challenge, { listClass: 'csd-list' }), plain: true })
  if (cs.solutions) sections.push({ id: 'solutions', title: 'Solutions', html: richTextToHTML(cs.solutions, { listClass: 'csd-list' }), plain: true })

  if (o.image || o.caption || o.stats?.length || o.highlights?.length) {
    const stats = o.stats?.length
      ? `<ul class="csd-stats">${o.stats.map((s) => `<li><span class="cs-stat-v">${esc(s.value)}</span><span class="cs-stat-l">${esc(s.label)}</span></li>`).join('')}</ul>`
      : ''
    const card = `<div class="csd-card"><div class="csd-card-media"><img src="${esc(mediaUrl(o.image))}" alt="${esc(media(o.image)?.alt)}" width="1000" height="667" loading="lazy" decoding="async"></div>${o.caption ? `<p class="csd-card-text">${esc(o.caption)}</p>` : ''}${stats}</div>`
    const quote = o.quote?.text
      ? `<blockquote class="csd-quote"><p>${esc(o.quote.text)}</p>${o.quote.attribution ? `<footer>${esc(o.quote.attribution)}</footer>` : ''}</blockquote>`
      : ''
    const tiles = o.highlights?.length ? `<ul class="csd-tiles">${o.highlights.map((h) => `<li>${esc(h.text)}</li>`).join('')}</ul>` : ''
    sections.push({ id: 'outcome', title: 'The Outcome', html: `<div class="csd-outcome">${card}${quote}${tiles}</div>`, plain: false })
  }
  if (cs.technology?.length) {
    const items = cs.technology
      .map(
        (t) =>
          `<li><span class="csd-tech-ico"><img decoding="async" src="${esc(t.icon || '/assets/icons/case-studies/tech/generic-ai.svg')}" alt="" width="30" height="30" loading="lazy"></span>${esc(t.name)}</li>`,
      )
      .join('')
    sections.push({ id: 'technology', title: 'Technology Stack', html: `<ul class="csd-tech">${items}</ul>`, plain: false })
  }

  const toc = sections.map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`).join('')
  const blocks = sections
    .map((s) => `    <div class="csd-block${s.plain ? ' csd-plain' : ''}" id="${s.id}"><h2>${s.title}</h2>${s.html}</div>`)
    .join('\n')
  const related = await relatedFor(cs)

  return `<section class="csd-hero"><div class="wrap">
  <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/case-studies">Case Studies</a></li><li aria-current="page">${esc(shorten(cs.cardTitle))}</li></ol></nav>
  <h1>${esc(cs.title)}</h1>
  <dl class="csd-tags"><div><dt>Industry</dt><dd>${esc(cs.industry)}</dd></div><div><dt>Services</dt><dd>${esc(cs.services)}</dd></div></dl>
</div></section>
<section class="csd-banner-sec"><div class="wrap"><div class="csd-banner"><img src="${esc(hero?.url)}"${srcset} alt="${esc(hero?.alt)}" width="1800" height="1000" decoding="async" fetchpriority="high"></div></div></section>
<section class="csd-body" data-sr-skip><div class="wrap csd-layout">
  <div class="csd-aside">
    <nav class="csd-toc" aria-label="On this page"><ol>${toc}</ol></nav>
    ${shareLinks(url)}
  </div>
  <div class="csd-content">
${blocks}
  </div>
</div></section>
${
  related.length
    ? `<section class="section light cs-more"><div class="wrap">
  <div class="section-head"><h2>More Case Studies</h2><a class="btn btn-outline" href="/case-studies">View All ${ARROW_ICON}</a></div>
  <div class="cs-grid">${related.map((r) => caseStudyTile(r)).join('')}</div>
</div></section>`
    : ''
}
${contactBand({ heading: 'Want results like these?', text: 'Tell us what you are working on and we will show you what a first step could look like.' })}`
}
