import { getPayloadClient } from '@/lib/data'
import { richTextToHTML } from '@/lib/richtext'
import type { Form } from '@/payload-types'

/**
 * Website forms: shared by the form sections (src/components/sections/ContactForms.tsx) and the server that receives
 * them (src/app/forms/enquiry/route.ts).
 */

/** Files the Enquiry form accepts (accept="…" on the form, and the server check). */
export const ATTACHMENT_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.png', '.jpg', '.jpeg', '.webp', '.zip']
/** Vercel rejects request bodies over 4.5 MB, so files stay under that. */
export const ATTACHMENT_MAX_MB = 4

/** Phone fields: digits, spaces, + ( ) -, 8 to 20 characters (the server checks the digit count too). */
export const PHONE_PATTERN = '[0-9 +\\(\\)\\-]{8,20}'

/** Loads a form from Leads → Forms (by id or populated doc), or null when it no longer exists. */
export async function loadForm(ref: number | Form | null | undefined): Promise<Form | null> {
  if (ref && typeof ref === 'object') return ref
  if (!ref) return null
  try {
    return await (await getPayloadClient()).findByID({ collection: 'forms', id: ref, depth: 0 })
  } catch {
    return null
  }
}

/** A form's confirmation message as plain text (the thank-you box shows text only). */
export const confirmationText = (form: Form) =>
  richTextToHTML(form.confirmationMessage)
    .replace(/<\/(p|h\d|li)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
