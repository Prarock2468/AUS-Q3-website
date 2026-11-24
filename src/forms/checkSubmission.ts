import path from 'path'
import type { Form } from '@/payload-types'
import { DEFAULT_FILE_TYPES, MAX_FILE_MB } from './fieldBlocks'

/**
 * Server-side check of a submitted website form against its definition in Leads → Forms: every field's required
 * flag, format and limits, the file fields' types and sizes, and the consent tick-box. Values the form does not ask
 * for are ignored. Mirrors what /js/enquiry-form.js checks in the browser, which a visitor can bypass.
 */

export type Attachment = { filename: string; content: Buffer; contentType: string }
export type Row = { name: string; label: string; value: string }
export type CheckResult =
  | { ok: true; rows: Row[]; attachments: Attachment[]; replyEmail?: string; visitorName?: string; consent: boolean }
  | { ok: false; error: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Phone numbers: international standard (E.164) is at most 15 digits; with +, spaces, dashes and brackets 20 characters. */
export const PHONE_MAX_LENGTH = 20
/**
 * A phone number as typed on the website: 8–20 characters of digits, spaces, +, -, dots and brackets, with 7–15
 * actual digits (so "+++---" or a 30-digit string is rejected). Used for every website form.
 */
export const isValidPhone = (v: string) => {
  const digits = v.replace(/\D/g, '').length
  return /^[0-9 +().-]{8,20}$/.test(v) && digits >= 7 && digits <= 15
}

export async function checkSubmission(
  form: Form,
  body: Record<string, unknown>,
  files: Map<string, File>,
): Promise<CheckResult> {
  const text = (k: string) => (typeof body[k] === 'string' || typeof body[k] === 'number' ? String(body[k]).trim() : '')
  const rows: Row[] = []
  const attachments: Attachment[] = []
  let replyEmail: string | undefined
  let visitorName: string | undefined

  for (const f of form.fields || []) {
    if (f.blockType === 'message') continue
    const label = f.label || f.name
    const err = (standard: string) => ({ ok: false as const, error: f.errorMessage || standard })

    if (f.blockType === 'checkbox') {
      const ticked = Boolean(text(f.name))
      if (f.required && !ticked) return err(`Please tick “${label}”.`)
      rows.push({ name: f.name, label, value: ticked ? 'Yes' : 'No' })
      continue
    }

    if (f.blockType === 'file') {
      const file = files.get(f.name)
      if (!file) {
        if (f.required) return err(`Please attach ${label}.`)
        continue
      }
      const allowed = (f.accept || DEFAULT_FILE_TYPES).toLowerCase().replace(/\s+/g, '').split(',').filter(Boolean)
      const ext = path.extname(file.name || '').toLowerCase()
      const maxMb = Math.min(f.maxSizeMb || MAX_FILE_MB, MAX_FILE_MB)
      if (!allowed.includes(ext)) return err(`${label}: this file type is not accepted (${allowed.join(', ')}).`)
      if (file.size > maxMb * 1024 * 1024) return err(`${label}: the file is too large (maximum ${maxMb} MB).`)
      const filename = path.basename(file.name).replace(/[^\w.\- ()]/g, '_').slice(-120)
      attachments.push({ filename, content: Buffer.from(await file.arrayBuffer()), contentType: file.type || 'application/octet-stream' })
      rows.push({ name: f.name, label, value: `${filename} (${Math.max(1, Math.round(file.size / 1024))} KB, sent by email)` })
      continue
    }

    const v = text(f.name)
    if (!v) {
      if (f.required) return err(`Please fill in “${label}”.`)
      continue
    }
    switch (f.blockType) {
      case 'email':
        if (!EMAIL.test(v) || v.length > 254) return err(`“${label}” is not a valid email address.`)
        replyEmail ||= v
        break
      case 'phone':
        if (!isValidPhone(v)) return err(`“${label}” is not a valid phone number.`)
        break
      case 'number':
        if (!Number.isFinite(Number(v))) return err(`“${label}” must be a number.`)
        break
      case 'date':
        if (!DATE.test(v) || Number.isNaN(Date.parse(v))) return err(`“${label}” is not a valid date.`)
        break
      case 'select':
        if (!(f.options || []).some((o) => o.value === v)) return err(`Please choose a valid option for “${label}”.`)
        break
      case 'textarea':
        if (v.length > 5000) return err(`“${label}” is too long (maximum 5000 characters).`)
        break
      default:
        if (v.length > 1000) return err(`“${label}” is too long (maximum 1000 characters).`)
        if (!visitorName && /name/i.test(f.name)) visitorName = v
    }
    // Selects store the chosen option's label, which is what people read in the CMS and the email.
    const shown = f.blockType === 'select' ? (f.options || []).find((o) => o.value === v)?.label || v : v
    rows.push({ name: f.name, label, value: shown })
  }

  const consent = Boolean(text('marketing'))
  if (form.showConsent !== false && !consent) return { ok: false, error: 'Please agree to the Privacy Policy to continue.' }
  return { ok: true, rows, attachments, replyEmail, visitorName, consent }
}
