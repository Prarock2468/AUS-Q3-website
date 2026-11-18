import { after } from 'next/server'
import { getPayloadClient } from '@/lib/data'

/**
 * Receives the enquiry forms (contact band and the "Share your project idea" pop-up).
 * /js/common.min.js posts JSON here.
 *
 * 1. Rejects spam and abuse: honeypot field, per-IP rate limit, size and length limits, server-side validation.
 * 2. Stores the enquiry in the CMS (Leads → Form submissions). This must succeed before the visitor sees "thanks".
 * 3. After responding, forwards it to the CRM (CRM_WEBHOOK_URL) and emails the sales team (LEADS_NOTIFY_TO).
 *    Each is retried once; a failure is logged and the enquiry stays safe in the CMS.
 */
const FORM_TITLE = 'Project enquiry'
const FIELDS = ['name', 'email', 'phone', 'company', 'message', 'area', 'country', 'form_id', 'page', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'ga_client_id', 'landing_page', 'referrer']
const REQUIRED = ['name', 'email', 'phone', 'company', 'message']
const MAX_LENGTH: Record<string, number> = { name: 200, email: 254, phone: 40, company: 200, message: 5000 }
const MAX_BODY_BYTES = 20_000

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

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: 'Request too large' }, { status: 413 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return Response.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }

  // Honeypot: real people never fill this hidden field. Answer "ok" so bots learn nothing.
  if (body.company_website) return Response.json({ ok: true })

  if (rateLimited(clientIp(request))) {
    return Response.json({ ok: false, error: 'Too many enquiries. Please try again in a few minutes.' }, { status: 429 })
  }

  const value = (k: string) => (typeof body[k] === 'string' || typeof body[k] === 'number' ? String(body[k]).trim() : '')
  const missing = REQUIRED.filter((k) => !value(k))
  if (missing.length) return Response.json({ ok: false, error: `Missing: ${missing.join(', ')}` }, { status: 422 })
  const tooLong = Object.entries(MAX_LENGTH).filter(([k, max]) => value(k).length > max).map(([k]) => k)
  if (tooLong.length) return Response.json({ ok: false, error: `Too long: ${tooLong.join(', ')}` }, { status: 422 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value('email'))) {
    return Response.json({ ok: false, error: 'Invalid email' }, { status: 422 })
  }
  if (!/^[+()\d\s.-]{6,40}$/.test(value('phone'))) {
    return Response.json({ ok: false, error: 'Invalid phone number' }, { status: 422 })
  }

  const referer = request.headers.get('referer') || ''
  const data: Record<string, string> = {}
  for (const key of FIELDS) {
    const v = value(key) || (key === 'page' ? referer : '')
    if (v) data[key] = v.slice(0, MAX_LENGTH[key] ?? 1000)
  }

  const payload = await getPayloadClient()
  try {
    let form = (await payload.find({ collection: 'forms', where: { title: { equals: FORM_TITLE } }, limit: 1 })).docs[0]
    if (!form) {
      form = await payload.create({
        collection: 'forms',
        data: {
          title: FORM_TITLE,
          fields: REQUIRED.map((name) => ({
            blockType: name === 'email' ? 'email' : name === 'message' ? 'textarea' : 'text',
            name,
            label: name[0].toUpperCase() + name.slice(1),
            required: true,
          })),
          confirmationType: 'message',
        } as any,
      })
    }
    await payload.create({
      collection: 'form-submissions',
      data: { form: form.id, submissionData: Object.entries(data).map(([field, v]) => ({ field, value: v })) } as any,
    })
  } catch (err) {
    payload.logger.error({ err }, 'Could not save enquiry')
    return Response.json({ ok: false, error: 'We could not send your enquiry. Please try again or email sales@q3tech.com.' }, { status: 500 })
  }

  const log = (msg: string, err: unknown) => payload.logger.error({ err, email: data.email }, msg)
  const submittedAt = new Date().toISOString()

  after(async () => {
    const webhook = process.env.CRM_WEBHOOK_URL
    if (webhook) {
      await withRetry(
        'CRM webhook',
        async () => {
          const res = await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, submitted_at: submittedAt, source: 'q3tech.com/en-au' }),
            signal: AbortSignal.timeout(8000),
          })
          if (!res.ok) throw new Error(`CRM webhook answered ${res.status}`)
        },
        log,
      )
    }

    const to = process.env.LEADS_NOTIFY_TO
    if (to) {
      await withRetry(
        'Lead email',
        () =>
          payload.sendEmail({
            to,
            replyTo: data.email,
            subject: `New enquiry: ${data.name} (${data.company})`,
            text: [...Object.entries(data).map(([k, v]) => `${k}: ${v}`), `submitted_at: ${submittedAt}`].join('\n'),
          }),
        log,
      )
    }
  })

  return Response.json({ ok: true })
}
