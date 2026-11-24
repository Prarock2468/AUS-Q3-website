/**
 * Gives the "Share your project idea" pop-up (Site settings → Page extras HTML) the same thank-you box as every other
 * form (src/components/ui/ThankYouBox.tsx): green tick, heading, message, and its Close button below. Keeps the pop-up's own
 * heading and message. Safe to run more than once: `npm run seed:thank-you`.
 */
import 'dotenv/config'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { thankYouBox } from './thankYouBox'

const payload = await getPayload({ config })
const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as unknown as Record<string, unknown>

const updates: Record<string, string> = {}
for (const key of ['extrasFull', 'extrasSimple']) {
  const html = settings[key]
  if (typeof html !== 'string' || !html.includes('form-done')) continue
  const $ = cheerio.load(html, null, false)
  let changed = 0
  $('.form-done').each((_, el) => {
    const $el = $(el)
    if ($el.children('.tick').length) return // already the shared box
    const heading = $el.find('h2, h3').first().text().trim()
    const message = $el.find('p').not('.demo-note').first().text().trim()
    const close = $el.find('[data-close-lead]').first()
    $el.replaceWith(thankYouBox({ heading, message, extraHtml: close.length ? $.html(close) : undefined }))
    changed++
  })
  if (changed) {
    updates[key] = $.html()
    payload.logger.info(`Site settings → ${key}: ${changed} thank-you box(es) updated.`)
  }
}

if (Object.keys(updates).length) {
  await payload.updateGlobal({ slug: 'site-settings', data: updates, context: { disableRevalidate: true } })
} else payload.logger.info('Pop-up thank-you box already matches. Nothing to do.')
process.exit(0)
