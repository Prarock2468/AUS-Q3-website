import { after } from 'next/server'
import path from 'path'
import type { Payload } from 'payload'
import { checkSubmission, isValidPhone, PHONE_MAX_LENGTH, type Attachment } from '@/forms/checkSubmission'
import { getPayloadClient } from '@/lib/data'
import { canSendEmail, loadEmailSettings, sendFormEmail } from '@/lib/mailer'
import { buildFormLeadEmail, buildLeadEmail, buildThankYouEmail, signOffEmail } from '@/lib/leadEmail'
import { ATTACHMENT_MAX_MB, ATTACHMENT_TYPES, loadForm } from '@/forms/website'

/**
 * Receives every website form:
 *  - "Form" sections (forms built in Leads → Forms; multipart with a form_ref, from /js/enquiry-form.js): every value
 *    is checked against that form's fields (src/forms/checkSubmission.ts) and saved under that form.
 *  - The contact band, the "Share your project idea" pop-up (JSON from /js/common.min.js) and the "Enquiry form"
 *    section (multipart with an optional file): fixed fields, saved under "Project enquiry".
 *
 * 1. Rejects spam and abuse: honeypot field, per-IP rate limit, size and length limits, server-side validation.
 * 2. Stores the enquiry in the CMS (Leads → Form submissions). This must succeed before the visitor sees "thanks".
 * 3. After responding, forwards it to the CRM (CRM_WEBHOOK_URL), emails the team (files attached) and sends the
 *    visitor a thank-you email. Recipients: the form's own "Send enquiries to", else Site settings → Email, else the
 *    server setting LEADS_NOTIFY_TO. Emails go through the mail server set in Site settings → Email, or the server's
 *    SMTP_* settings (src/lib/mailer.ts). Each is retried once; a failure is logged and the enquiry stays safe in
 *    the CMS. Files are only sent by email, never stored on the website.
 */
const FORM_TITLE = 'Project enquiry'
const FIELDS = ['name', 'email', 'phone', 'company', 'message', 'area', 'country', 'marketing', 'form_id', 'page', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'ga_client_id', 'landing_page', 'referrer']
/** Where a submission came from: saved and emailed with every form's answers. */
const META = ['form_id', 'page', 'landing_page', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'ga_client_id']
/** Every fixed-field form asks for these; the others (phone, company…) are checked by the form itself. */
const REQUIRED = ['name', 'email', 'message']
/** Longest accepted value per field: email per RFC 5321 (254), phone per E.164 with formatting (20). */
const MAX_LENGTH: Record<string, number> = { name: 200, email: 254, phone: PHONE_MAX_LENGTH, company: 200, message: 5000 }
const MAX_JSON_BYTES = 20_000
const MAX_FILE_BYTES = ATTACHMENT_MAX_MB * 1024 * 1024
const MAX_MULTIPART_BYTES = MAX_FILE_BYTES + 100_000

/* Rate limit: 5 enquiries per IP per 10 minutes. In memory, so it is per server instance; put a WAF or edge rate
 * limit in front for a multi-instance deployment. */
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 10_000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
  return recent.length > MAX_PER_WINDOW
}

const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'

async function withRetry(label: string, task: () => Promise<unknown>, log: (msg: string, err: unknown) => void) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await task()
      return
    } catch (err) {
      if (attempt === 2) log(`${label} failed after 2 attempts; the enquiry is still saved in the CMS.`, err)
      else await new Promise((r) => setTimeout(r, 1500))
    }
  }
}

/** "a@x.com, b@y.com" → the valid addresses joined with commas, or '' when there are none. */
const recipients = (list?: string | null) =>
  (list || '')
    .split(/[,;\s]+/)
    .filter((a) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a))
    .join(', ')

const fail = (status: number, error: string) => Response.json({ ok: false, error }, { status })

type Body = Record<string, unknown>

/** Reads the request: JSON (text fields only) or multipart form data (text fields plus any files, by field name). */
async function readBody(request: Request): Promise<{ body: Body; files: Map<string, File> } | Response> {
  const size = Number(request.headers.get('content-length') || 0)
  const files = new Map<string, File>()
  if ((request.headers.get('content-type') || '').includes('multipart/form-data')) {
    if (size > MAX_MULTIPART_BYTES) return fail(413, `The files are too large (maximum ${ATTACHMENT_MAX_MB} MB in total).`)
    let form: FormData
    try {
      form = await request.formData()
    } catch {
      return fail(400, 'Invalid form data')
    }
    const body: Body = {}
    for (const [key, v] of form.entries()) {
      if (typeof v === 'string') body[key] = v
      else if (v.size > 0) files.set(key, v)
    }
    return { body, files }
  }
  if (size > MAX_JSON_BYTES) return fail(413, 'Request too large')
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(400, 'Invalid request')
    return { body, files }
  } catch {
    return fail(400, 'Invalid JSON')
  }
}

const textOf = (body: Body, k: string) =>
  typeof body[k] === 'string' || typeof body[k] === 'number' ? String(body[k]).trim().slice(0, 1000) : ''

export async function POST(request: Request) {
  const read = await readBody(request)
  if (read instanceof Response) return read
  const { body, files } = read

  // Honeypot: real people never fill this hidden field. Answer "ok" so bots learn nothing.
  if (body.company_website) return Response.json({ ok: true })

  if (rateLimited(clientIp(request))) return fail(429, 'Too many enquiries. Please try again in a few minutes.')

  const payload = await getPayloadClient()
  if (body.form_ref) return submitBuiltForm(request, payload, body, files)
  return submitFixedForm(request, payload, body, files.get('attachment'))
}

/* ---------------------------------------------------------------------------------------------------------------
 * Forms built in Leads → Forms ("Form" section)
 * ------------------------------------------------------------------------------------------------------------- */

async function submitBuiltForm(request: Request, payload: Payload, body: Body, files: Map<string, File>) {
  const form = await loadForm(Number(body.form_ref))
  if (!form) return fail(400, 'This form is no longer available. Please reload the page.')

  const checked = await checkSubmission(form, body, files)
  if (!checked.ok) return fail(422, checked.error)

  const meta: Record<string, string> = {}
  for (const k of META) {
    const v = textOf(body, k) || (k === 'page' ? request.headers.get('referer') || '' : '')
    if (v) meta[k] = v
  }
  if (checked.consent) meta.marketing = 'yes'

  let submissionId: number | string | undefined
  try {
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: form.id,
        submissionData: [
          ...checked.rows.map((r) => ({ field: r.name, value: r.value })),
          ...Object.entries(meta).map(([field, value]) => ({ field, value })),
        ],
      },
    })
    submissionId = submission.id
  } catch (err) {
    payload.logger.error({ err }, 'Could not save enquiry')
    return fail(500, 'We could not send your enquiry. Please try again or email sales@q3tech.com.')
  }

  const log = (msg: string, err: unknown) => payload.logger.error({ err, form: form.title }, msg)
  const submittedAt = new Date()

  after(async () => {
    await sendToCrm({ form: form.title, ...Object.fromEntries(checked.rows.map((r) => [r.name, r.value])), ...meta }, submittedAt, log)

    const settings = await loadEmailSettings(payload)
    const to = recipients(form.notifyTo) || recipients(settings.notifyTo) || recipients(process.env.LEADS_NOTIFY_TO)
    if (to) {
      const mail = buildFormLeadEmail({
        formTitle: form.title,
        rows: checked.rows,
        meta,
        visitorName: checked.visitorName,
        submissionId,
        submittedAt,
      })
      await withRetry(
        'Lead email',
        () => sendFormEmail(payload, settings, { to, replyTo: checked.replyEmail, ...mail, attachments: checked.attachments }),
        log,
      )
    }

    // Thank-you email to the address in the form's first Email field.
    const visitor = checked.replyEmail
    if (visitor && canSendEmail(settings) && form.autoReply !== false && settings.autoReply !== false && process.env.LEADS_AUTOREPLY !== 'off') {
      const thanks = buildThankYouEmail({ name: checked.visitorName || '' }, settings)
      await withRetry('Thank-you email', () => sendFormEmail(payload, settings, { to: visitor, replyTo: signOffEmail(settings), ...thanks }), log)
    }
  })

  return Response.json({ ok: true })
}

/* ---------------------------------------------------------------------------------------------------------------
 * Fixed-field forms: contact band, pop-up, "Enquiry form" section (saved under "Project enquiry")
 * ------------------------------------------------------------------------------------------------------------- */

async function submitFixedForm(request: Request, payload: Payload, body: Body, file: File | undefined) {
  const value = (k: string) => (typeof body[k] === 'string' || typeof body[k] === 'number' ? String(body[k]).trim() : '')
  const missing = REQUIRED.filter((k) => !value(k))
  if (missing.length) return fail(422, `Missing: ${missing.join(', ')}`)
  const tooLong = Object.entries(MAX_LENGTH).filter(([k, max]) => value(k).length > max).map(([k]) => k)
  if (tooLong.length) return fail(422, `Too long: ${tooLong.join(', ')}`)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value('email'))) return fail(422, 'Invalid email')
  if (value('phone') && !isValidPhone(value('phone'))) return fail(422, 'Invalid phone number')

  let attachment: Attachment | undefined
  if (file) {
    const ext = path.extname(file.name || '').toLowerCase()
    if (!ATTACHMENT_TYPES.includes(ext)) return fail(422, `This file type is not accepted (${ATTACHMENT_TYPES.join(', ')}).`)
    if (file.size > MAX_FILE_BYTES) return fail(413, `The file is too large (maximum ${ATTACHMENT_MAX_MB} MB).`)
    const filename = path.basename(file.name).replace(/[^\w.\- ()]/g, '_').slice(-120)
    attachment = { filename, content: Buffer.from(await file.arrayBuffer()), contentType: file.type || 'application/octet-stream' }
  }

  const referer = request.headers.get('referer') || ''
  const data: Record<string, string> = {}
  for (const key of FIELDS) {
    // The marketing tick-box arrives as "on" when ticked; store it as a plain yes.
    const v = key === 'marketing' ? (value(key) ? 'yes' : '') : value(key) || (key === 'page' ? referer : '')
    if (v) data[key] = v.slice(0, MAX_LENGTH[key] ?? 1000)
  }
  // The CMS keeps the file's name and size; the file itself only goes to the sales team by email.
  if (attachment) data.attachment = `${attachment.filename} (${Math.max(1, Math.round(attachment.content.length / 1024))} KB, sent by email)`

  let submissionId: number | string | undefined
  try {
    let form = (await payload.find({ collection: 'forms', where: { title: { equals: FORM_TITLE } }, limit: 1 })).docs[0]
    if (!form) {
      form = await payload.create({
        collection: 'forms',
        data: {
          title: FORM_TITLE,
          fields: ['name', 'email', 'phone', 'company', 'message'].map((name) => ({
            blockType: name === 'email' ? 'email' : name === 'message' ? 'textarea' : 'text',
            name,
            label: name[0].toUpperCase() + name.slice(1),
            required: REQUIRED.includes(name),
          })),
          confirmationType: 'message',
          // Holds the fixed-field forms' enquiries; not shown on the website itself.
          showConsent: false,
          showCaptcha: false,
        } as any,
      })
    }
    const submission = await payload.create({
      collection: 'form-submissions',
      data: { form: form.id, submissionData: Object.entries(data).map(([field, v]) => ({ field, value: v })) } as any,
    })
    submissionId = submission.id
  } catch (err) {
    payload.logger.error({ err }, 'Could not save enquiry')
    return fail(500, 'We could not send your enquiry. Please try again or email sales@q3tech.com.')
  }

  const log = (msg: string, err: unknown) => payload.logger.error({ err, email: data.email }, msg)
  const submittedAt = new Date()

  after(async () => {
    await sendToCrm(data, submittedAt, log)

    const settings = await loadEmailSettings(payload)
    const to = recipients(settings.notifyTo) || recipients(process.env.LEADS_NOTIFY_TO)
    if (to) {
      // Layout and wording: src/lib/leadEmail.ts. Replying goes straight to the visitor.
      const mail = buildLeadEmail(data, { submissionId, submittedAt })
      await withRetry(
        'Lead email',
        () => sendFormEmail(payload, settings, { to, replyTo: data.email, ...mail, attachments: attachment ? [attachment] : undefined }),
        log,
      )
    }

    // Confirmation email to the visitor (only with a real mail server; replies go to the sales address).
    if (canSendEmail(settings) && settings.autoReply !== false && process.env.LEADS_AUTOREPLY !== 'off') {
      const thanks = buildThankYouEmail(data, settings)
      const replyTo = signOffEmail(settings)
      await withRetry('Thank-you email', () => sendFormEmail(payload, settings, { to: data.email, replyTo, ...thanks }), log)
    }
  })

  return Response.json({ ok: true })
}

/** Forwards an enquiry to the CRM webhook (CRM_WEBHOOK_URL), when one is set. */
async function sendToCrm(data: Record<string, string>, submittedAt: Date, log: (msg: string, err: unknown) => void) {
  const webhook = process.env.CRM_WEBHOOK_URL
  if (!webhook) return
  await withRetry(
    'CRM webhook',
    async () => {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, submitted_at: submittedAt.toISOString(), source: 'q3tech.com/en-au' }),
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(`CRM webhook answered ${res.status}`)
    },
    log,
  )
}
