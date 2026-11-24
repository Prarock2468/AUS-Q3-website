/**
 * Moves the Contact page form to the form builder:
 *  1. Creates "Contact form" in Leads → Forms with the same fields as today (Full Name, Email, Company, Phone,
 *     Attachment, Message), consent, captcha, note and thank-you text, unless it exists.
 *  2. On /contact, replaces the "Enquiry form" section that follows "Contact info" with a "Form" section using it
 *     (published page and, when there is one, the unpublished draft, which stays a draft).
 * After this the form's fields are edited in Leads → Forms → Contact form. Safe to run more than once:
 * `npm run seed:contact-form-builder`.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'
import type { Form, Page } from '../../payload-types'

type Section = NonNullable<Page['layout']>[number]
const TITLE = 'Contact form'
const context = { disableRevalidate: true }
const payload = await getPayload({ config })

/** A one-paragraph rich text value. */
const paragraph = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      },
    ],
  },
})

// 1. The form.
let form = (await payload.find({ collection: 'forms', where: { title: { equals: TITLE } }, limit: 1, depth: 0 })).docs[0] as Form | undefined
if (form) payload.logger.info(`Leads → Forms → "${TITLE}" already exists (id ${form.id}); left as is.`)
else {
  form = (await payload.create({
    collection: 'forms',
    context,
    data: {
      title: TITLE,
      fields: [
        { blockType: 'text', name: 'name', label: 'Full Name', required: true, width: 100, placeholder: 'Enter full name' },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 100, placeholder: 'Enter email' },
        { blockType: 'text', name: 'company', label: 'Company', width: 50, placeholder: 'Enter company' },
        { blockType: 'phone', name: 'phone', label: 'Phone Number', width: 50, placeholder: 'Enter phone number' },
        { blockType: 'file', name: 'attachment', label: 'Attachment', width: 100 },
        { blockType: 'textarea', name: 'message', label: 'Briefly Describe Your Requirement', required: true, width: 100, placeholder: 'Enter message' },
      ],
      submitButtonLabel: 'Submit',
      confirmationType: 'message',
      confirmationMessage: paragraph('Our team will get back to you as soon as possible.'),
      thanksHeading: 'Thanks, we’ve received your enquiry',
      showConsent: true,
      privacyUrl: 'https://www.q3tech.com/privacy-policy/',
      showCaptcha: true,
      secureNote: 'Your information is secure and never shared with third parties.',
      autoReply: true,
    } as never,
  })) as Form
  payload.logger.info(`Created Leads → Forms → "${TITLE}" (id ${form.id}).`)
}

// 2. The Contact page: Enquiry form after Contact info → Form section.
const target = (layout: Page['layout']) =>
  (layout || []).findIndex((b, i, all) => b.blockType === 'enquiryForm' && all[i - 1]?.blockType === 'contactInfo')
const swap = (layout: Page['layout']) => {
  const all = layout || []
  const at = target(all)
  if (at < 0) return all
  const old = all[at] as { anchorId?: string | null }
  return [...all.slice(0, at), { blockType: 'formSection', form: form!.id, anchorId: old.anchorId || null } as Section, ...all.slice(at + 1)]
}
const get = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', where: { path: { equals: '/contact' } }, depth: 0, limit: 1, draft })).docs[0]
const published = await get(false)
const latest = await get(true)
if (!published) throw new Error('/contact not found.')

if (target(published.layout) >= 0) {
  await payload.update({ collection: 'pages', id: published.id, data: { layout: swap(published.layout), _status: 'published' }, context })
  payload.logger.info('Published /contact: the form now comes from Leads → Forms → Contact form.')
} else payload.logger.info('Published /contact: no Enquiry form after Contact info (already moved?); left as is.')
if (latest._status === 'draft' && target(latest.layout) >= 0) {
  await payload.update({ collection: 'pages', id: latest.id, draft: true, data: { layout: swap(latest.layout), _status: 'draft' }, context })
  payload.logger.info('Unpublished /contact draft: same change made; it is still a draft.')
}
process.exit(0)
