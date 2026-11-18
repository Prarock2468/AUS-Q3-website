/**
 * Moves every page's own FAQ section onto the shared FAQ (Common Component, key `faq`), keeping that page's content:
 * each FAQ section becomes "Common component (saved) → FAQ", in the same position, with the page's questions in
 * "FAQs for this page" and its style in "FAQ style for this page" (only when it differs from the saved style).
 *
 * Skipped, and reported, so nothing changes by surprise:
 *  - pages whose latest version is an unpublished draft (publishing here would publish that draft too);
 *  - FAQ sections whose heading, intro or "Schedule a call" card differ from the saved FAQ (the shared entry's
 *    would show instead).
 * Run `npm run seed:faq` first (it creates the FAQ entry). Safe to run more than once: `npm run seed:faq-pages`.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'
import type { Page } from '../../payload-types'

type Section = NonNullable<Page['layout']>[number]
type Faq = Extract<Section, { blockType: 'faq' }>

const context = { disableRevalidate: true }
const payload = await getPayload({ config })

const { docs: entries } = await payload.find({ collection: 'commonComponent', where: { key: { equals: 'faq' } }, depth: 0, limit: 1 })
const entry = entries[0]
const saved = entry?.layout?.find((b) => b.blockType === 'faq') as Faq | undefined
if (!entry || !saved) throw new Error('Common Component "faq" with an FAQ section not found. Run `npm run seed:faq` first.')

const { docs: pages } = await payload.find({ collection: 'pages', depth: 0, limit: 0, pagination: false, draft: true })
let moved = 0
for (const page of pages) {
  const layout = page.layout || []
  if (!layout.some((b) => b.blockType === 'faq')) continue
  if (page._status !== 'published') {
    payload.logger.warn(`Skipped ${page.path}: it has unpublished changes. Publish or discard them, then run again.`)
    continue
  }

  let changed = 0
  const next = layout.map((b): Section => {
    if (b.blockType !== 'faq') return b
    const differs = (['heading', 'intro', 'showSalesContact'] as const).filter((k) => (b[k] ?? null) !== (saved[k] ?? null))
    if (differs.length) {
      payload.logger.warn(`Skipped an FAQ on ${page.path}: its ${differs.join(', ')} differ from the saved FAQ.`)
      return b
    }
    changed++
    return {
      blockType: 'commonComponentRef',
      component: entry.id,
      faqs: (b.items || []).map(({ question, answer }) => ({ question, answer })),
      faqStyle: b.style && b.style !== saved.style ? b.style : null,
    }
  })
  if (!changed) continue

  await payload.update({ collection: 'pages', id: page.id, data: { layout: next, _status: 'published' }, context })
  moved += changed
  payload.logger.info(`${page.path}: FAQ moved to the shared FAQ with its ${changed > 1 ? 'own sections' : 'own questions'}.`)
}
payload.logger.info(`Done: ${moved} FAQ section(s) moved.`)
process.exit(0)
