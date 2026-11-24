import nodemailer from 'nodemailer'
import type { Payload } from 'payload'
import type { SiteSetting } from '@/payload-types'
import { decryptSecret } from './secretBox'

/**
 * Sends the website's form emails (enquiry + thank-you). Uses the mail server set in Site settings → Email → Mail
 * server (SMTP) when it is complete; otherwise Payload's email set from the server's SMTP_* settings.
 * (Payload's own emails, such as password resets, always use the server settings.)
 */

export type EmailSettings = NonNullable<SiteSetting['formEmails']>
type Message = {
  to: string
  replyTo?: string
  subject: string
  text: string
  html: string
  attachments?: { filename: string; content: Buffer; contentType?: string }[]
}

/** Tells the Site settings read hook to return the stored (encrypted) password instead of the mask. */
export const REVEAL_SMTP = { revealSmtpPassword: true }

/** Site settings → Email, with the stored SMTP password (encrypted). Server-side use only. */
export async function loadEmailSettings(payload: Payload): Promise<EmailSettings> {
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, context: REVEAL_SMTP })
    return settings.formEmails || {}
  } catch {
    return {}
  }
}

type Smtp = { host: string; port: number; user: string; pass: string; from: string; fromName: string }

/** The mail server from Site settings, or null when it is not filled in completely. */
export function adminSmtp(settings: EmailSettings): Smtp | null {
  const s = settings.smtp
  const pass = decryptSecret(s?.password)
  if (!s?.host?.trim() || !s.username?.trim() || !pass) return null
  return {
    host: s.host.trim(),
    port: Number(s.port) || 465,
    user: s.username.trim(),
    pass,
    from: s.fromAddress?.trim() || s.username.trim(),
    fromName: s.fromName?.trim() || 'Q3 Technologies Australia',
  }
}

/** True when form emails can actually be sent (mail server in Site settings, or SMTP_HOST on the server). */
export const canSendEmail = (settings: EmailSettings) => Boolean(adminSmtp(settings) || process.env.SMTP_HOST)

type Transport = ReturnType<typeof nodemailer.createTransport>
const transports = new Map<string, Transport>()
function transportFor(smtp: Smtp) {
  const id = `${smtp.host}:${smtp.port}:${smtp.user}:${smtp.pass}`
  let t = transports.get(id)
  if (!t) {
    transports.clear()
    t = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    })
    transports.set(id, t)
  }
  return t
}

export async function sendFormEmail(payload: Payload, settings: EmailSettings, message: Message) {
  const smtp = adminSmtp(settings)
  if (smtp) {
    await transportFor(smtp).sendMail({ from: { name: smtp.fromName, address: smtp.from }, ...message })
    return
  }
  await payload.sendEmail(message)
}

/** Logs in to the given mail server and sends one test email. Throws with the server's error message. */
export async function sendTestEmail(smtp: Smtp, to: string) {
  const t = transportFor(smtp)
  await t.verify()
  await t.sendMail({
    from: { name: smtp.fromName, address: smtp.from },
    to,
    subject: 'Test email from the Q3 website',
    text: 'This is a test from Site settings → Email. The website can send email with this mail server.',
  })
}
