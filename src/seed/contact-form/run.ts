/**
 * Turns the top of the Contact page into two editable sections, shown side by side: "Contact info" (heading, intro,
 * email, phone numbers, "What happens next") followed by "Enquiry form" (the form, which sends attachments and the
 * thank-you email).
 *  1. Reads the content from the original Contact Us HTML (the latest version of /contact that has it).
 *  2. Replaces, in the same position, either the "Contact Us" Custom HTML section or an Enquiry form section that is
 *     not yet preceded by Contact info and is titled "Contact Us" (an earlier step of this change). Done in the
 *     published page and, when there is one, in the unpublished draft (which stays a draft).
 * Stops without changing anything if the HTML is not the expected shape. Safe to run more than once:
 * `npm run seed:contact-form`.
 */
import 'dotenv/config'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { textToRichText } from '../../fields/richTextValue'
import type { Page } from '../../payload-types'

type Section = NonNullable<Page['layout']>[number]
const context = { disableRevalidate: true }
const payload = await getPayload({ config })
const fail = (msg: string): never => {
  throw new Error(`Contact page: ${msg}. Nothing was changed.`)
}

/**
 * The section to replace: the Contact Us HTML; or, only on a page that has no Contact info section yet, an Enquiry
 * form titled "Contact Us" (from an earlier step of this change). Other Enquiry forms are never touched.
 */
const isTarget = (b: Section, prev: Section | undefined, layout: NonNullable<Page['layout']>) =>
  (b.blockType === 'htmlSection' && (b.label === 'Contact Us' || /class="git-hero"/.test(b.html || ''))) ||
  (b.blockType === 'enquiryForm' &&
    b.heading === 'Contact Us' &&
    prev?.blockType !== 'contactInfo' &&
    !layout.some((x) => x.blockType === 'contactInfo'))
const hasTarget = (layout: Page['layout']) => (layout || []).some((b, i, all) => isTarget(b, all[i - 1], all))

const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: '/contact' } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) fail('/contact not found')
if (!hasTarget(published.layout) && !(latest._status === 'draft' && hasTarget(latest.layout))) {
  payload.logger.info('/contact already uses Contact info + Enquiry form. Nothing to do.')
  process.exit(0)
}

// 1. The original Contact Us HTML: in the draft, the published page, or the most recent saved version that has it.
const htmlOf = (p?: { layout?: Page['layout'] }) => {
  const b = (p?.layout || []).find((x) => x.blockType === 'htmlSection' && /git-grid/.test(x.html || ''))
  return b && b.blockType === 'htmlSection' ? b.html : undefined
}
let sourceHtml = htmlOf(latest) || htmlOf(published)
if (!sourceHtml) {
  const versions = await payload.findVersions({ collection: 'pages', where: { parent: { equals: published.id } }, sort: '-updatedAt', limit: 100, depth: 0 })
  for (const v of versions.docs) if ((sourceHtml = htmlOf(v.version as Page))) break
}
if (!sourceHtml) fail('no version of the Contact Us HTML has the form layout')

const $ = cheerio.load(sourceHtml!, null, false)
const text = (sel: string) => $(sel).first().text().replace(/\s+/g, ' ').trim()
const heading = text('.git-intro h1, .git-intro h2')
if (!heading) fail('no heading in .git-intro')
const rows = $('.git-info-row').toArray()
const emailRow = rows.find((r) => $(r).find('a[href^="mailto:"]').length)
const phoneRow = rows.find((r) => $(r).find('.git-phones').length)
const phones = phoneRow
  ? $(phoneRow)
      .find('.git-phones li')
      .toArray()
      .map((li) => {
        const $li = $(li)
        const flag = $li.find('img.git-flag').attr('src')?.match(/git-flag-(\w+)\.svg/)?.[1]
        const icon = $li.find('.git-wa').length ? 'whatsapp' : flag && ['in', 'us', 'au'].includes(flag) ? flag : 'phone'
        return { number: $li.find('a').text().trim(), icon: icon as 'whatsapp' | 'in' | 'us' | 'au' | 'phone' }
      })
  : []
if (phones.some((p) => !p.number)) fail('a phone number is empty')

const info = {
  blockType: 'contactInfo' as const,
  heading,
  isPageHeading: $('.git-intro h1').length > 0,
  showBreadcrumb: $('nav.breadcrumb').length > 0,
  text: textToRichText(text('.git-intro p')),
  emailLabel: emailRow ? $(emailRow).find('.git-k').text().trim() || 'Email' : 'Email',
  email: emailRow ? $(emailRow).find('a[href^="mailto:"]').text().trim() : null,
  phonesLabel: phoneRow ? $(phoneRow).find('.git-k').text().trim() || 'Call Us' : 'Call Us',
  phones,
  nextHeading: text('.git-next-h') || 'What Happens Next?',
  nextSteps: $('.git-steps li').toArray().map((li) => ({ text: $(li).text().replace(/\s+/g, ' ').trim() })),
  anchorId: null,
}
const form = {
  blockType: 'enquiryForm' as const,
  heading: null,
  text: null,
  submitLabel: text('form button[type=submit]') || 'Submit',
  privacyUrl: $('.git-agree a').attr('href') || 'https://www.q3tech.com/privacy-policy/',
  secureNote: text('.git-secure') || null,
  // Same typographic apostrophe as the other forms' thank-you heading.
  thanksHeading: (text('.form-done h2, .form-done h3') || 'Thanks, we’ve received your enquiry').replace(/'/g, '’'),
  thanksText: text('.form-done p.muted') || null,
  anchorId: null,
}
payload.logger.info(`Read "${heading}": email ${info.email}, ${phones.length} phone numbers, ${info.nextSteps.length} steps.`)

// 2. Swap it in, in the same position: the first matching section becomes Contact info + Enquiry form (any other
//    Enquiry form on the page is left alone).
const swap = (layout: Page['layout']) => {
  const all = layout || []
  const at = all.findIndex((b, i) => isTarget(b, all[i - 1], all))
  return at < 0 ? all : [...all.slice(0, at), ...([info, form] as unknown as Section[]), ...all.slice(at + 1)]
}
if (hasTarget(published.layout)) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info('Published /contact: now "Contact info" + "Enquiry form", side by side.')
}
if (latest._status === 'draft' && hasTarget(latest.layout)) {
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info('Unpublished /contact draft: same change made; it is still a draft.')
}
process.exit(0)
