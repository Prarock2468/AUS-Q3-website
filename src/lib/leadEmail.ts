import { esc } from './html'

/**
 * The "new enquiry" email sent to the sales team (LEADS_NOTIFY_TO) for every website enquiry.
 * Returns the subject plus an HTML body and a plain-text fallback with the same content.
 */

type Lead = Record<string, string>

const FORM_NAMES: Record<string, string> = {
  'cta-form': 'Contact form (page footer)',
  'lead-form': '“Share your project idea” pop-up',
  'contact-form': 'Contact page form',
  'enquiry-form': 'Enquiry form',
}

/** Field labels, grouped in the order they appear in the email. Empty fields are left out. */
const CONTACT: [string, string][] = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['company', 'Company'],
  ['country', 'Country'],
  ['area', 'Interested in'],
  ['marketing', 'Marketing emails'],
  ['attachment', 'Attachment'],
]
const SOURCE: [string, string][] = [
  ['form', 'Form'],
  ['page', 'Sent from'],
  ['landing_page', 'First page visited'],
  ['referrer', 'Came from'],
  ['utm_source', 'UTM source'],
  ['utm_medium', 'UTM medium'],
  ['utm_campaign', 'UTM campaign'],
  ['utm_term', 'UTM term'],
  ['utm_content', 'UTM content'],
  ['gclid', 'Google Ads click id'],
  ['ga_client_id', 'Google Analytics client id'],
  ['submitted', 'Received'],
]

const siteURL = () => (process.env.NEXT_PUBLIC_SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
const adminURL = () => (process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

/** A site path ("/services") as a full address; full addresses and other text are returned unchanged. */
const absolute = (v: string) => (v.startsWith('/') && siteURL() ? siteURL() + v : v)

export function buildLeadEmail(lead: Lead, opts: { submissionId?: number | string; submittedAt: Date }) {
  const values: Lead = {
    ...lead,
    form: FORM_NAMES[lead.form_id] || lead.form_id || '',
    page: lead.page ? absolute(lead.page) : '',
    landing_page: lead.landing_page ? absolute(lead.landing_page) : '',
    marketing: lead.marketing ? 'Yes, happy to receive them' : '',
    submitted: `${opts.submittedAt.toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      dateStyle: 'full',
      timeStyle: 'short',
    })} (Sydney time)`,
  }
  const adminLink =
    opts.submissionId != null && adminURL() ? `${adminURL()}/admin/collections/form-submissions/${opts.submissionId}` : ''

  const subject = `New enquiry: ${lead.name}${lead.company ? `, ${lead.company}` : ''}`
  const rows = (fields: [string, string][]) => fields.filter(([k]) => values[k]).map(([k, label]) => [label, values[k], k])

  /* Plain text */
  const textBlock = (title: string, fields: [string, string][]) =>
    [title, ...rows(fields).map(([label, v]) => `${label}: ${v}`)].join('\n')
  const text = [
    `New enquiry from the website`,
    '',
    textBlock('CONTACT', CONTACT),
    '',
    'MESSAGE',
    lead.message || '',
    '',
    textBlock('WHERE IT CAME FROM', SOURCE),
    ...(adminLink ? ['', `View in the CMS: ${adminLink}`] : []),
    '',
    `Reply to this email to answer ${lead.name} directly.`,
  ].join('\n')

  /* HTML (inline styles: email clients ignore stylesheets) */
  const font = 'font-family:Arial,Helvetica,sans-serif;'
  const link = (href: string, label: string) => `<a href="${esc(href)}" style="color:#1d4ed8;">${esc(label)}</a>`
  const cell = (key: string, v: string) =>
    key === 'email'
      ? link(`mailto:${v}`, v)
      : key === 'phone'
        ? link(`tel:${v.replace(/[^\d+]/g, '')}`, v)
        : /^https?:\/\//.test(v)
          ? link(v, v)
          : esc(v)
  const table = (fields: [string, string][]) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;${font}font-size:14px;">${rows(
      fields,
    )
      .map(
        ([label, v, k]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;width:170px;vertical-align:top;">${esc(label)}</td><td style="padding:6px 0;color:#111827;word-break:break-word;">${cell(k, v)}</td></tr>`,
      )
      .join('')}</table>`
  const heading = (t: string) =>
    `<h2 style="${font}font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin:24px 0 8px;">${t}</h2>`

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f4f6;">
<div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;padding:28px;${font}color:#111827;">
  <h1 style="${font}font-size:20px;margin:0 0 4px;">New enquiry from ${esc(lead.name)}</h1>
  <p style="${font}font-size:14px;color:#6b7280;margin:0;">${esc(values.form)}${lead.company ? ` · ${esc(lead.company)}` : ''}</p>
  ${heading('Contact')}${table(CONTACT)}
  ${heading('Message')}
  <div style="${font}font-size:15px;line-height:1.6;white-space:pre-wrap;background:#f9fafb;border-left:3px solid #1d4ed8;padding:12px 16px;">${esc(lead.message)}</div>
  ${heading('Where it came from')}${table(SOURCE)}
  ${
    adminLink
      ? `<p style="margin:28px 0 0;"><a href="${esc(adminLink)}" style="${font}display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;">Open in the CMS</a></p>`
      : ''
  }
  <p style="${font}font-size:13px;color:#6b7280;margin:24px 0 0;">Reply to this email to answer ${esc(lead.name)} directly.</p>
</div></body></html>`

  return { subject, text, html }
}

/** Fallback for the "Regards" address when Site settings → Email leaves it empty. */
export const SALES_EMAIL = process.env.SALES_EMAIL || 'sales@q3tech.com'

/** The editable parts of the thank-you email (Site settings → Email); empty values use the defaults below. */
export type ThankYouSettings = {
  thanksSubject?: string | null
  thanksMessage?: string | null
  signOffName?: string | null
  signOffEmail?: string | null
}

const DEFAULT_THANKS = [
  'Thank you for getting in touch with Q3 Technologies. We have received your enquiry, and a member of our Australian team will reply within 4 business hours (AEST).',
  'If your request is urgent, simply reply to this email.',
].join('\n\n')

/** The address replies to the thank-you email go to, and the one shown under "Regards". */
export const signOffEmail = (settings?: ThankYouSettings) => settings?.signOffEmail?.trim() || SALES_EMAIL

/**
 * The thank-you email sent to the person who submitted an enquiry: "Hi {name}," then the message and the sign-off,
 * all editable in Site settings → Email. It deliberately does not repeat their message (the address typed into the
 * form is not verified, so this email must not be usable to send arbitrary text to someone else).
 */
export function buildThankYouEmail(lead: Lead, settings: ThankYouSettings = {}) {
  const name = (lead.name || '').trim() || 'there'
  const subject = settings.thanksSubject?.trim() || 'Thank you for contacting Q3 Technologies'
  const paragraphs = (settings.thanksMessage?.trim() || DEFAULT_THANKS)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const team = settings.signOffName?.trim() || 'Q3 Technologies Sales Team'
  const email = signOffEmail(settings)

  const text = [`Hi ${name},`, '', ...paragraphs.flatMap((p) => [p, '']), 'Regards,', team, email].join('\n')

  const font = 'font-family:Arial,Helvetica,sans-serif;'
  const p = (html: string) => `<p style="${font}font-size:15px;line-height:1.6;color:#111827;margin:0 0 16px;">${html}</p>`
  const mail = `<a href="mailto:${esc(email)}" style="color:#1d4ed8;">${esc(email)}</a>`
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f4f6;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
  ${p(`Hi ${esc(name)},`)}
  ${paragraphs.map((x) => p(esc(x).replace(/\n/g, '<br>'))).join('\n  ')}
  <p style="${font}font-size:15px;line-height:1.6;color:#111827;margin:24px 0 0;">Regards,<br><strong>${esc(team)}</strong><br>${mail}</p>
</div></body></html>`

  return { subject, text, html }
}

/**
 * The "new enquiry" email for a form built in Leads → Forms: every answer with its label (in the form's order), then
 * where it came from. Long answers keep their line breaks; email and phone answers are clickable.
 */
export function buildFormLeadEmail(opts: {
  formTitle: string
  rows: { name: string; label: string; value: string }[]
  meta: Lead
  visitorName?: string
  submissionId?: number | string
  submittedAt: Date
}) {
  const { formTitle, rows, meta } = opts
  const who = opts.visitorName || rows.find((r) => /mail/i.test(r.name))?.value || 'website visitor'
  const subject = `New enquiry: ${who} (${formTitle})`
  const source: [string, string][] = [
    ['Form', formTitle],
    ['Sent from', meta.page ? absolute(meta.page) : ''],
    ['First page visited', meta.landing_page ? absolute(meta.landing_page) : ''],
    ['Came from', meta.referrer || ''],
    ['UTM source', meta.utm_source || ''],
    ['UTM medium', meta.utm_medium || ''],
    ['UTM campaign', meta.utm_campaign || ''],
    ['Marketing emails', meta.marketing ? 'Yes, happy to receive them' : ''],
    [
      'Received',
      `${opts.submittedAt.toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'full', timeStyle: 'short' })} (Sydney time)`,
    ],
  ]
  const shownSource = source.filter(([, v]) => v)
  const adminLink =
    opts.submissionId != null && adminURL() ? `${adminURL()}/admin/collections/form-submissions/${opts.submissionId}` : ''

  const text = [
    `New enquiry from the website: ${formTitle}`,
    '',
    ...rows.map((r) => `${r.label}: ${r.value}`),
    '',
    'WHERE IT CAME FROM',
    ...shownSource.map(([k, v]) => `${k}: ${v}`),
    ...(adminLink ? ['', `View in the CMS: ${adminLink}`] : []),
  ].join('\n')

  const font = 'font-family:Arial,Helvetica,sans-serif;'
  const link = (href: string, label: string) => `<a href="${esc(href)}" style="color:#1d4ed8;">${esc(label)}</a>`
  const cell = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
      ? link(`mailto:${v}`, v)
      : /^[+()\d\s.-]{8,20}$/.test(v) && /\d{6,}/.test(v.replace(/\D/g, ''))
        ? link(`tel:${v.replace(/[^\d+]/g, '')}`, v)
        : /^https?:\/\//.test(v)
          ? link(v, v)
          : esc(v).replace(/\n/g, '<br>')
  const table = (list: [string, string][]) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;${font}font-size:14px;">${list
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;width:170px;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;color:#111827;word-break:break-word;">${cell(v)}</td></tr>`,
      )
      .join('')}</table>`
  const heading = (t: string) =>
    `<h2 style="${font}font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin:24px 0 8px;">${t}</h2>`

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f4f6;">
<div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;padding:28px;${font}color:#111827;">
  <h1 style="${font}font-size:20px;margin:0 0 4px;">New enquiry from ${esc(who)}</h1>
  <p style="${font}font-size:14px;color:#6b7280;margin:0;">${esc(formTitle)}</p>
  ${heading('Answers')}${table(rows.map((r) => [r.label, r.value]))}
  ${heading('Where it came from')}${table(shownSource)}
  ${
    adminLink
      ? `<p style="margin:28px 0 0;"><a href="${esc(adminLink)}" style="${font}display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;">Open in the CMS</a></p>`
      : ''
  }
</div></body></html>`

  return { subject, text, html }
}
