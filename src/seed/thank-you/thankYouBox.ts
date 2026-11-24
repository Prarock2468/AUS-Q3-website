import { esc } from '../../lib/html'

/** Default heading (as in src/components/ui/ThankYouBox.tsx). */
export const THANKS_HEADING = 'Thanks, we’ve received your enquiry'

/**
 * The website forms' thank-you box as HTML, for the "Share your project idea" pop-up that is saved as HTML in Site
 * settings. Same markup as the website's <ThankYouBox> (src/components/ui/ThankYouBox.tsx): keep the two in step.
 */
export function thankYouBox(opts: {
  heading?: string | null
  message?: string | null
  extraHtml?: string
}) {
  // margin-block:auto centres the box vertically inside a flex card (the Contact page card); elsewhere it is 0.
  return `<div class="form-done" tabindex="-1" hidden style="margin-block:auto;"><div class="tick" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 5 5 9-10"/></svg></div><h3 style="font-size:var(--t-xl);line-height:1.25;margin:0 0 var(--space-8);color:var(--gray-950);">${esc(opts.heading || THANKS_HEADING)}</h3><p class="muted" style="color:var(--gray-600);margin:0;">${esc(opts.message || 'Our team will get back to you as soon as possible.')}</p>${opts.extraHtml ? `<div style="margin-top:var(--space-16);">${opts.extraHtml}</div>` : ''}</div>`
}
