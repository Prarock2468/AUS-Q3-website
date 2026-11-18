import type { Page, SiteSetting } from '@/payload-types'
import { getCaseStudies, getInsights } from '../data'
import { ARROW_ICON, attr, esc } from '../html'
import { richTextToHTML } from '../richtext'
import { loadCommonComponent, renderCommonSection, withAnchor } from './common'
import { blogCard, caseStudyTile, contactBand, author, salesCard } from './parts'
import { INSIGHT_INDUSTRIES, INSIGHT_SERVICES } from '@/collections/Insights'

export type Block = NonNullable<Page['layout']>[number]

const label = (options: { label: string; value: string }[], v: string) => options.find((o) => o.value === v)?.label || v

/** Turn a page's blocks into section HTML, in order. */
export async function renderBlocks(blocks: Page['layout'], settings: SiteSetting): Promise<string> {
  const out: string[] = []
  for (const block of blocks || []) out.push(await renderBlock(block, settings))
  return out.join('\n')
}

export async function renderBlock(block: Block, settings: SiteSetting): Promise<string> {
  switch (block.blockType) {
    case 'htmlSection':
      return block.html || ''

    case 'contactBand':
      return contactBand(block)

    case 'sharedSection': {
      let html = (settings as any)[block.section] || ''
      if (block.anchorId) html = html.replace(/^(\s*<section\b)(?![^>]*\bid=)/, `$1 id="${esc(block.anchorId)}"`)
      return html
    }

    case 'faq': {
      const items = (block.items || [])
        .map(
          (i) =>
            `<details><summary>${esc(i.question)}</summary><div>${richTextToHTML(i.answer)}</div></details>`,
        )
        .join('')
      const style = block.style || 'home-faq'
      const intro = !block.intro
        ? ''
        : style === 'home'
          ? `<p class="faq-intro">${esc(block.intro)}</p>`
          : `<p style="margin-top:16px;max-width:36ch">${esc(block.intro)}</p>`
      const head = style === 'home-faq' ? `<h2 id="home-faq-title">${esc(block.heading)}</h2>` : `<h2>${esc(block.heading)}</h2>`
      const open = style === 'home-faq' ? '<section class="home-faq" aria-labelledby="home-faq-title">' : '<section class="section">'
      return `${open}<div class="wrap two-col">
<div class="sticky">${head}${intro}
${block.showSalesContact ? salesCard(settings) : ''}</div>
<div class="${style === 'home' ? 'faq home-faq' : 'faq'}">${items}</div>
</div></section>`
    }

    case 'caseStudyList': {
      const all = await getCaseStudies()
      return `<section class="list-sec"><div class="wrap">
<h2 class="visually-hidden">${esc(block.heading || 'All case studies')}</h2>
<div class="cs-grid">${all.map((cs, i) => caseStudyTile(cs, { priority: i === 0 })).join('')}</div>
</div></section>`
    }

    case 'insightList': {
      const all = await getInsights()
      const cards = all
        .map((p, i) => {
          const a = author(p.author)
          const ind = (p.industries || []) as string[]
          const svc = (p.serviceAreas || []) as string[]
          const q = [p.title, p.category, a?.name, ...ind.map((v) => label(INSIGHT_INDUSTRIES, v)), ...svc.map((v) => label(INSIGHT_SERVICES, v))]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          const data = `${attr('data-tags', p.topic || '')} data-svc="${esc(svc.join(' '))}" data-ind="${esc(ind.join(' '))}" data-q="${esc(q)}"`
          return blogCard(p, { filterData: data, priority: i === 0 })
        })
        .join('')
      return `<section class="list-sec"><div class="wrap">
<h2 class="visually-hidden">All insights</h2>
<div class="blog-grid" data-page-size="${esc(block.pageSize || 12)}">${cards}</div>
</div></section>`
    }

    case 'latestInsights': {
      const published = await getInsights()
      const picked = (block.posts || [])
        .map((p) => published.find((x) => x.id === (typeof p === 'object' ? p.id : p)))
        .filter((p): p is (typeof published)[number] => Boolean(p))
      const all = picked.length ? picked : published.slice(0, block.limit || 5)
      return `<section class="section alt insights-sec"><div class="wrap">
<div class="section-head"><div><h2>${esc(block.heading || 'Insights')}</h2></div><div class="blog-nav"><a class="btn btn-outline" href="/insights">View all ${ARROW_ICON}</a><div class="tq-arrows"><button type="button" class="blog-arrow" data-blog-prev aria-label="Previous posts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button><button type="button" class="blog-arrow" data-blog-next aria-label="Next posts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div></div></div>
<div class="blog-row" data-blog-row>${all.map((p) => blogCard(p)).join('')}</div>
</div></section>`
    }

    // (A Testimonial slider only exists inside a Common Component entry, drawn by renderCommonSection.)
    case 'clientLogos':
    case 'testimonials':
    case 'caseStudiesSlider':
      return (await renderCommonSection(block)) || ''

    case 'commonComponentRef': {
      const entry = await loadCommonComponent(block.component)
      // Questions and a style set on this page replace the saved FAQ's (heading and intro stay).
      const pageFaqs = block.faqs?.length ? block.faqs : null
      const pageFaqStyle = block.faqStyle || null
      const out: string[] = []
      for (const saved of entry?.layout || []) {
        const section =
          saved.blockType === 'faq' && (pageFaqs || pageFaqStyle)
            ? { ...saved, items: pageFaqs || saved.items, style: pageFaqStyle || saved.style }
            : saved
        out.push((await renderCommonSection(section)) ?? (await renderBlock(section as Block, settings)))
      }
      return withAnchor(out.join('\n'), block.anchorId)
    }

    default:
      return ''
  }
}
