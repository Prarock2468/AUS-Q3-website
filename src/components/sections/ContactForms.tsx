import Script from 'next/script'
import type { CSSProperties, ReactNode } from 'react'
import { DEFAULT_FILE_TYPES, MAX_FILE_MB } from '@/forms/fieldBlocks'
import { ATTACHMENT_TYPES, PHONE_PATTERN, confirmationText, loadForm } from '@/forms/website'
import { richTextToHTML } from '@/lib/richtext'
import type { ContactInfoBlock, EnquiryFormBlock, Form, FormSectionBlock } from '@/payload-types'
import { ASSET_VERSION } from '@/templates'
import { Breadcrumb } from '../ui/cards'
import { CheckIcon, MailIcon, PhoneIcon, ShieldIcon, UploadIcon, WhatsAppIcon } from '../ui/icons'
import { ScriptOwned } from '../ui/ScriptOwned'
import { ThankYouBox } from '../ui/ThankYouBox'
import { CaptchaQuestion } from './ContactBand'
import { RichText, hasText } from '../ui/RichText'

/*
 * Contact Us design (section.git-hero), used by the "Contact info", "Enquiry form" and "Form" sections. A Contact
 * info section followed by a form section is drawn as one section, side by side (see PageSections); either one alone
 * takes the full width. Forms are submitted by /js/enquiry-form.js (files included) to /forms/enquiry; the captcha
 * and the file box's file name are set up by common.min.js.
 */

type Info = Omit<ContactInfoBlock, 'blockType'>
type Enquiry = Omit<EnquiryFormBlock, 'blockType'>
type FormSection = Omit<FormSectionBlock, 'blockType'>

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`
/** Short unique part of a section's id, for the ids of its fields. */
const keyOf = (b: { id?: string | null }) => (b.id || 'form').replace(/[^\w-]/g, '').slice(-8)

/* --- Layout --------------------------------------------------------------------------------------------------- */

/** The section around the info panel and/or form card; one column when only one of them is shown. */
function ContactLayout({
  anchorId,
  info,
  single,
  withScript,
  children,
}: {
  anchorId?: string | null
  info?: Info
  single: 'info' | 'form' | false
  withScript: boolean
  children: ReactNode
}) {
  const grid: CSSProperties | undefined =
    single === 'form'
      ? { gridTemplateColumns: 'minmax(0,1fr)', maxWidth: 760, marginInline: 'auto' }
      : single === 'info'
        ? { gridTemplateColumns: 'minmax(0,1fr)' }
        : undefined
  const breadcrumb = info?.showBreadcrumb
  return (
    // The section only slides up under the header (the CSS's negative top margin) when it is the top of the page,
    // i.e. when it shows the breadcrumb; lower down a page it sits below the previous section.
    <section className="git-hero" id={anchorId || undefined} style={breadcrumb ? undefined : { marginTop: 0 }} suppressHydrationWarning>
      {/* The design's own stylesheet (scripts/build-form-css.mjs), so it also works on templates without main.min.css. */}
      <link rel="stylesheet" href={`/css/site-form.css?v=${ASSET_VERSION}`} />
      <div className="wrap">
        {breadcrumb ? <Breadcrumb current={info.heading || 'Contact Us'} /> : null}
        <div className="git-grid" style={grid}>
          {children}
        </div>
      </div>
      {withScript ? <Script src="/js/enquiry-form.js" strategy="afterInteractive" /> : null}
    </section>
  )
}

/* --- Contact info panel --------------------------------------------------------------------------------------- */

function PhoneIconFor({ icon, first }: { icon?: string | null; first: boolean }) {
  if (icon === 'whatsapp') return <WhatsAppIcon />
  if (icon === 'none') return null
  if (icon === 'in' || icon === 'us' || icon === 'au') {
    const load = first ? { fetchPriority: 'high' as const } : { decoding: 'async' as const, loading: 'lazy' as const }
    return <img {...load} className="git-ph-ico git-flag" src={`/assets/icons/git-flag-${icon}.svg`} alt="" width={24} height={24} />
  }
  return <PhoneIcon small />
}

/** The dark panel of a "Contact info" section (.git-dark is display:contents in the CSS). */
function InfoPanel({ b }: { b: Info }) {
  const phones = (b.phones || []).filter((p) => p.number?.trim())
  const steps = (b.nextSteps || []).filter((s) => s.text?.trim())
  const email = b.email?.trim()
  const heading = b.heading || 'Contact Us'
  const hasInfo = Boolean(email || phones.length)
  return (
    <div className="git-dark">
      <div className="git-intro">
        {/* As the page heading it is the first section's h1, which common.min.js splits into animated lines. */}
        {b.isPageHeading ? <ScriptOwned as="h1">{heading}</ScriptOwned> : <h2>{heading}</h2>}
        {hasText(b.text) ? (
          <p>
            <RichText value={b.text} />
          </p>
        ) : null}
      </div>
      {hasInfo || steps.length ? (
        <div className="git-aside">
          {hasInfo ? (
            <div className="git-info">
              {email ? (
                <div className="git-info-row">
                  <MailIcon />
                  <div>
                    <p className="git-k">{b.emailLabel || 'Email'}</p>
                    <p className="git-v">
                      <a href={`mailto:${email}`}>{email}</a>
                    </p>
                  </div>
                </div>
              ) : null}
              {phones.length ? (
                <div className="git-info-row">
                  <PhoneIcon />
                  <div>
                    <p className="git-k">{b.phonesLabel || 'Call Us'}</p>
                    <ul className="git-phones">
                      {phones.map((p, i) => (
                        <li key={p.id || i}>
                          <PhoneIconFor icon={p.icon} first={i === 0} />
                          <a href={telHref(p.number)}>{p.number.trim()}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {steps.length ? (
            <div className="git-next">
              <p className="git-next-h">{b.nextHeading || 'What Happens Next?'}</p>
              <ul className="git-info git-steps">
                {steps.map((s, i) => (
                  <li key={s.id || i}>
                    <CheckIcon />
                    <span>{s.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/* --- Form card pieces ----------------------------------------------------------------------------------------- */

/** The white card around a form, with its optional title and the thank-you box. */
function FormCard({ heading, text, styles, thanks, children }: { heading?: string | null; text?: unknown; styles?: string; thanks: ReactNode; children: ReactNode }) {
  return (
    <div className="git-form lead-card" style={{ display: 'flex', flexDirection: 'column' }}>
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      {heading || hasText(text) ? (
        <div className="enquiry-title" style={{ marginBottom: 20 }}>
          {heading ? <h2 style={{ margin: '0 0 8px' }}>{heading}</h2> : null}
          {hasText(text) ? (
            <p className="muted" style={{ margin: 0 }}>
              <RichText value={text} />
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
      {thanks}
    </div>
  )
}

/** The hidden parts every form starts with: the error summary and the spam trap. */
function FormStart({ hpId }: { hpId: string }) {
  return (
    <>
      <div className="form-errors" tabIndex={-1} role="alert" hidden suppressHydrationWarning />
      <div className="hp" aria-hidden="true">
        <label htmlFor={hpId}>Leave this field empty</label>
        <input id={hpId} name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  )
}

const Agree = ({ id, privacyUrl }: { id: string; privacyUrl?: string | null }) => (
  <label className="git-agree" htmlFor={id} data-label="privacy policy consent">
    <input type="checkbox" name="marketing" id={id} required />
    <span>
      I agree to the{' '}
      <a href={privacyUrl || 'https://www.q3tech.com/privacy-policy/'} rel="noopener">
        Privacy Policy
      </a>{' '}
      and receive exclusive insights.
    </span>
  </label>
)

const Captcha = ({ id }: { id: string }) => (
  <div className="captcha lf">
    <label htmlFor={id} data-label="security answer">
      <CaptchaQuestion />
    </label>
    <input id={id} name="captcha" type="text" inputMode="numeric" autoComplete="off" maxLength={3} placeholder="?" data-captcha="" required aria-label="Security question: type the answer" />
  </div>
)

const SecureNote = ({ text }: { text?: string | null }) =>
  text ? (
    <p className="git-secure">
      <ShieldIcon />
      {text}
    </p>
  ) : null

/** A file field's box ("Choose a file" is replaced by the picked file's name). */
const FileBox = ({ input }: { input: ReactNode }) => (
  <div className="git-file-box">
    {input}
    <span data-file-name="" suppressHydrationWarning>
      Choose a file
    </span>
    <UploadIcon />
  </div>
)

/* --- Enquiry form (fixed fields) ------------------------------------------------------------------------------- */

function EnquiryCard({ b, formId, withTitle }: { b: Enquiry; formId: string; withTitle: boolean }) {
  const key = keyOf(b)
  const id = (name: string) => `eq-${key}-${name}`
  const types = ATTACHMENT_TYPES.join(',')
  return (
    <FormCard heading={withTitle ? b.heading : null} text={withTitle ? b.text : null} thanks={<ThankYouBox heading={b.thanksHeading} message={b.thanksText} />}>
      <form id={id('form')} data-enquiry-form="" data-form-id={formId} noValidate suppressHydrationWarning>
        <FormStart hpId={id('hp')} />
        <div className="lf">
          <label htmlFor={id('name')} data-label="full name">
            Full Name*
          </label>
          <input id={id('name')} name="name" type="text" placeholder="Enter full name" autoComplete="name" maxLength={200} required />
        </div>
        <div className="lf">
          <label htmlFor={id('email')} data-label="email">
            Email*
          </label>
          <input id={id('email')} name="email" type="email" placeholder="Enter email" autoComplete="email" maxLength={254} required />
        </div>
        <div className="lf-row">
          <div className="lf">
            <label htmlFor={id('org')} data-label="company">
              Company
            </label>
            <input id={id('org')} name="company" type="text" placeholder="Enter company" autoComplete="organization" maxLength={200} />
          </div>
          <div className="lf">
            <label htmlFor={id('phone')} data-label="phone number">
              Phone Number
            </label>
            <input id={id('phone')} name="phone" type="tel" placeholder="Enter phone number" autoComplete="tel" inputMode="tel" pattern={PHONE_PATTERN} />
          </div>
        </div>
        <div className="lf git-file">
          <label htmlFor={id('file')} data-label="attachment">
            Attachment
          </label>
          <FileBox input={<input id={id('file')} name="attachment" type="file" accept={types} data-types={types} />} />
        </div>
        <div className="lf">
          <label htmlFor={id('msg')} data-label="message">
            Briefly Describe Your Requirement*
          </label>
          <textarea id={id('msg')} name="message" rows={3} placeholder="Enter message" maxLength={5000} required />
        </div>
        <Agree id={id('agree')} privacyUrl={b.privacyUrl} />
        <div className="lead-submit">
          <Captcha id={id('cap')} />
          <button className="btn btn-primary lead-send" type="submit" suppressHydrationWarning>
            {b.submitLabel || 'Submit'}
          </button>
        </div>
        <SecureNote text={b.secureNote} />
      </form>
    </FormCard>
  )
}

/* --- Form built in Leads → Forms ------------------------------------------------------------------------------- */

type Field = NonNullable<Form['fields']>[number]

/** One field of a built form (every field type of src/forms/fieldBlocks.ts). */
function BuiltField({ f, id }: { f: Field; id: (name: string) => string }) {
  if (f.blockType === 'message') return <div className="lf form-note" dangerouslySetInnerHTML={{ __html: richTextToHTML(f.message) }} />
  const label = f.label || f.name
  const common = { id: id(f.name), name: f.name, required: Boolean(f.required) || undefined, 'data-error': f.errorMessage || undefined }
  const placeholder = 'placeholder' in f ? f.placeholder || undefined : undefined
  const lab = (
    <label htmlFor={common.id} data-label={label.toLowerCase()}>
      {label}
      {f.required ? '*' : ''}
    </label>
  )
  switch (f.blockType) {
    case 'text':
      return (
        <div className="lf">
          {lab}
          <input {...common} type="text" placeholder={placeholder} defaultValue={f.defaultValue || undefined} maxLength={1000} />
        </div>
      )
    case 'email':
      return (
        <div className="lf">
          {lab}
          <input {...common} type="email" placeholder={placeholder} autoComplete="email" maxLength={254} />
        </div>
      )
    case 'phone':
      return (
        <div className="lf">
          {lab}
          <input {...common} type="tel" placeholder={placeholder} autoComplete="tel" inputMode="tel" pattern={PHONE_PATTERN} />
        </div>
      )
    case 'number':
      return (
        <div className="lf">
          {lab}
          <input {...common} type="number" placeholder={placeholder} defaultValue={f.defaultValue ?? undefined} />
        </div>
      )
    case 'date':
      return (
        <div className="lf">
          {lab}
          <input {...common} type="date" />
        </div>
      )
    case 'textarea':
      return (
        <div className="lf">
          {lab}
          <textarea {...common} rows={3} placeholder={placeholder} maxLength={5000} defaultValue={f.defaultValue || ''} />
        </div>
      )
    case 'select':
      return (
        <div className="lf">
          {lab}
          <select {...common} defaultValue={f.defaultValue || ''}>
            <option value="">{f.placeholder || 'Please choose'}</option>
            {(f.options || []).map((o, i) => (
              <option key={o.id || i} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )
    case 'checkbox':
      return (
        <label className="git-agree" htmlFor={common.id} data-label={label.toLowerCase()}>
          <input type="checkbox" {...common} defaultChecked={Boolean(f.defaultValue)} />
          <span>
            {label}
            {f.required ? '*' : ''}
          </span>
        </label>
      )
    case 'file': {
      const types = (f.accept || DEFAULT_FILE_TYPES).replace(/\s+/g, '')
      const mb = Math.min(f.maxSizeMb || MAX_FILE_MB, MAX_FILE_MB)
      return (
        <div className="lf git-file">
          {lab}
          <FileBox input={<input {...common} type="file" accept={types} data-types={types} data-max-mb={mb} />} />
        </div>
      )
    }
    default:
      return null
  }
}

/** Fields in rows: two fields of width 50 or less share a row (.lf-row), the rest take the full width. */
function BuiltFields({ fields, id }: { fields: Field[]; id: (name: string) => string }) {
  const half = (x?: Field) => !!x && x.blockType !== 'message' && 'width' in x && !!x.width && x.width <= 50
  const rows: Field[][] = []
  for (let i = 0; i < fields.length; i++) {
    if (half(fields[i]) && half(fields[i + 1])) rows.push([fields[i], fields[++i]])
    else rows.push([fields[i]])
  }
  return rows.map((row, i) =>
    row.length === 2 ? (
      <div key={i} className="lf-row">
        <BuiltField f={row[0]} id={id} />
        <BuiltField f={row[1]} id={id} />
      </div>
    ) : (
      <BuiltField key={i} f={row[0]} id={id} />
    ),
  )
}

/** The site CSS styles text inputs only; dropdown, number and date fields get the same pill look here. */
const BUILT_FORM_CSS =
  '.git-form .lf select,.git-form .lf input[type=number],.git-form .lf input[type=date]{border-radius:999px;background-color:#f5f5f5;border:1px solid transparent;height:44px;min-height:44px;line-height:1.4;padding:0 24px;font-size:14px;color:#0a0a0a;width:100%}.git-form .lf select{padding-right:40px}.git-form .form-note{margin:4px 0 12px;color:var(--gray-600)}'

function BuiltFormCard({ form, heading, text, sectionKey }: { form: Form; heading?: string | null; text?: unknown; sectionKey: string }) {
  const id = (name: string) => `df-${sectionKey}-${name.replace(/[^\w-]/g, '')}`
  const redirect = form.confirmationType === 'redirect' ? form.redirect?.url : null
  return (
    <FormCard heading={heading} text={text} styles={BUILT_FORM_CSS} thanks={<ThankYouBox heading={form.thanksHeading} message={confirmationText(form)} />}>
      <form id={id('form')} data-enquiry-form="" data-form-id={`form-${form.id}`} data-redirect={redirect || undefined} noValidate suppressHydrationWarning>
        <FormStart hpId={id('_hp')} />
        <input type="hidden" name="form_ref" defaultValue={form.id} />
        <BuiltFields fields={form.fields || []} id={id} />
        {form.showConsent !== false ? <Agree id={id('_agree')} privacyUrl={form.privacyUrl} /> : null}
        <div className="lead-submit">
          {form.showCaptcha !== false ? <Captcha id={id('_cap')} /> : null}
          <button className="btn btn-primary lead-send" type="submit" suppressHydrationWarning>
            {form.submitButtonLabel || 'Submit'}
          </button>
        </div>
        <SecureNote text={form.secureNote} />
      </form>
    </FormCard>
  )
}

/* --- The page sections ---------------------------------------------------------------------------------------- */

/** "Contact info" on its own. */
export function ContactInfo({ block }: { block: Info }) {
  return (
    <ContactLayout anchorId={block.anchorId} info={block} single="info" withScript={false}>
      <InfoPanel b={block} />
    </ContactLayout>
  )
}

/** "Enquiry form" on its own (with its heading), or next to the "Contact info" before it. */
export function EnquiryForm({ block, info }: { block: Enquiry; info?: Info }) {
  if (!info) {
    return (
      <ContactLayout anchorId={block.anchorId} single="form" withScript>
        <EnquiryCard b={block} formId="enquiry-form" withTitle />
      </ContactLayout>
    )
  }
  return (
    <ContactLayout anchorId={info.anchorId || block.anchorId} info={info} single={false} withScript>
      <InfoPanel b={info} />
      <EnquiryCard b={block} formId={info.isPageHeading ? 'contact-form' : 'enquiry-form'} withTitle={false} />
    </ContactLayout>
  )
}

/** "Form" (a form from Leads → Forms) on its own, or next to the "Contact info" before it. */
export async function FormSection({ block, info }: { block: FormSection; info?: Info }) {
  const form = await loadForm(block.form)
  if (!form) return info ? <ContactInfo block={info} /> : null
  if (!info) {
    return (
      <ContactLayout anchorId={block.anchorId} single="form" withScript>
        <BuiltFormCard form={form} heading={block.heading} text={block.text} sectionKey={keyOf(block)} />
      </ContactLayout>
    )
  }
  return (
    <ContactLayout anchorId={info.anchorId || block.anchorId} info={info} single={false} withScript>
      <InfoPanel b={info} />
      <BuiltFormCard form={form} sectionKey={keyOf(block)} />
    </ContactLayout>
  )
}
