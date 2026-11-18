import type { Insight } from '@/payload-types'
import { getInsights } from '../data'
import { ARROW_ICON, esc, shorten, slugify } from '../html'
import { headingsOf, richTextToHTML } from '../richtext'
import { author, blogCard, contactBand, media, mediaUrl } from './parts'

const STAR =
  '<svg class="lucide lucide-star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "03 Sep 2026", in Sydney time. */
export const formatDate = (iso?: string | null) => {
  if (!iso) return ''
  const parts = new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'numeric', year: 'numeric', timeZone: 'Australia/Sydney' }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)?.value || ''
  return `${get('day')} ${MONTHS[Number(get('month')) - 1]} ${get('year')}`
}

async function relatedFor(post: Insight) {
  const all = await getInsights()
  const picked = (post.related || []).filter((r): r is Insight => typeof r === 'object' && r !== null)
  if (picked.length) return picked.map((p) => all.find((a) => a.id === p.id) || p)
  return all
    .filter((o) => o.id !== post.id)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3)
}

export async function renderInsight(post: Insight) {
  const a = author(post.author)
  const cover = media(post.coverImage)
  const faqHeading = post.faqHeading || 'FAQs'
  const toc = [...headingsOf(post.body)]
  if (post.faqs?.length) toc.push({ id: slugify(faqHeading), text: faqHeading })

  const faqs = post.faqs?.length
    ? `<h2 id="${slugify(faqHeading)}">${esc(faqHeading)}</h2>\n<div class="faq">${post.faqs
        .map((f) => `<details><summary>${esc(f.question)}</summary><div>${richTextToHTML(f.answer)}</div></details>`)
        .join('')}</div>`
    : ''

  const authorBox = a
    ? `<div class="ins-author"><img class="blog-ini" src="${esc(mediaUrl(a.photo))}" alt="" width="56" height="56" loading="lazy" decoding="async"><div><p class="ins-author-n"><strong>${esc(a.name)}</strong><em>${esc(a.role)}</em></p>${a.bio ? `<p>${esc(a.bio)}</p>` : ''}</div>${
        a.linkedin
          ? `<a class="ins-author-in" href="${esc(a.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(a.name)} on LinkedIn"><img decoding="async" src="/assets/icons/ic-linkedin.svg" alt="" width="36" height="36" loading="lazy"></a>`
          : ''
      }</div>`
    : ''

  const related = await relatedFor(post)

  return `<section class="ins-page"><div class="wrap">
  <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/insights">Insights</a></li><li aria-current="page">${esc(shorten(post.title))}</li></ol></nav>
  <div class="ins-layout">
    <div class="ins-side">
      <nav class="ins-toc" aria-label="Table of contents"><p class="ins-toc-t">Table of Contents</p><ol>${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ol></nav>
    </div>
    <div class="ins-col">
      <p class="ins-meta"><span class="ins-tag">${esc(post.category)}</span><span>Published: <strong>${esc(formatDate(post.publishedDate))}</strong></span>${post.readTime ? `<span>${esc(post.readTime)}</span>` : ''}</p>
      <h1>${esc(post.title)}</h1>
      ${a ? `<p class="ins-by"><img class="blog-ini" src="${esc(mediaUrl(a.photo))}" alt="" width="34" height="34" loading="lazy" decoding="async"><span><strong>${esc(a.name)}</strong> <em>${esc(a.role)}</em></span></p>` : ''}
      ${cover ? `<img fetchpriority="high" class="ins-cover" src="${esc(cover.url)}" alt="${esc(cover.alt)}" width="876" height="614" decoding="async">` : ''}
      ${post.summary ? `<aside class="ins-summary" aria-labelledby="ins-sum-h"><p class="ins-sum-head"><span class="ins-sum-ic" aria-hidden="true">${STAR}</span><span id="ins-sum-h">Quick Summary</span></p><p>${esc(post.summary)}</p></aside>` : ''}
      <article class="ins-body">
${richTextToHTML(post.body, { headingIds: true })}
${faqs}
</article>
      ${authorBox}
    </div>
  </div>
</div></section>
${
  related.length
    ? `<section class="section alt ins-more"><div class="wrap">
  <div class="section-head"><h2>More Insights</h2><a class="btn btn-outline" href="/insights">View All ${ARROW_ICON}</a></div>
  <div class="blog-grid">${related.map((r) => blogCard(r)).join('')}</div>
</div></section>`
    : ''
}
${contactBand({ heading: 'Let’s Solve Your Next Technology Challenge', text: 'Talk to our expert and get clarity on your roadmap—no pressure, no obligations.' })}`
}
