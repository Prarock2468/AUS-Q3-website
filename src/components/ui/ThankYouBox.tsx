import type { ReactNode } from 'react'
import { TickIcon } from './icons'

/** Default heading of every form's thank-you box. */
export const THANKS_HEADING = 'Thanks, we’ve received your enquiry'

/**
 * The thank-you box every website form shows after a successful submit (contact band, Enquiry form, Contact page,
 * forms built in Leads → Forms): green tick, heading, message, then optional extra content. Sizes and colours are
 * set here so it looks the same inside any form card. The site scripts reveal it by removing `hidden`.
 * The "Share your project idea" pop-up has the same box, saved as HTML in Site settings (src/seed/thank-you).
 */
export function ThankYouBox({ heading, message, children }: { heading?: string | null; message?: string | null; children?: ReactNode }) {
  return (
    // margin-block:auto centres the box vertically inside a flex card (the Contact page card); elsewhere it is 0.
    <div className="form-done" tabIndex={-1} hidden style={{ marginBlock: 'auto' }} suppressHydrationWarning>
      <div className="tick" aria-hidden="true">
        <TickIcon />
      </div>
      <h3 style={{ fontSize: 'var(--t-xl)', lineHeight: 1.25, margin: '0 0 var(--space-8)', color: 'var(--gray-950)' }}>
        {heading || THANKS_HEADING}
      </h3>
      <p className="muted" style={{ color: 'var(--gray-600)', margin: 0 }}>
        {message || 'Our team will get back to you as soon as possible.'}
      </p>
      {children ? <div style={{ marginTop: 'var(--space-16)' }}>{children}</div> : null}
    </div>
  )
}
