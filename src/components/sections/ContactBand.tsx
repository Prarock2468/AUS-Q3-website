import { ThankYouBox } from '../ui/ThankYouBox'
import { RichText, hasText } from '../ui/RichText'

type Props = { heading?: string | null; text?: unknown; thanksText?: string | null; anchorId?: string | null }

/** The "2 + 3 =" question; common.min.js writes a new random sum on load. */
export const CaptchaQuestion = () => (
  <span className="cap-q" data-captcha-q="" suppressHydrationWarning>
    2 + 3 =
  </span>
)

/**
 * Contact band with the "Share your project idea" form (section.contact-band), submitted by /js/common.min.js to
 * /forms/enquiry. Used by the "Contact form band" page section and at the end of case studies and insights.
 */
export function ContactBand({ heading, text, thanksText, anchorId }: Props) {
  return (
    <section className="contact-band" id={anchorId || undefined}>
      <div className="wrap">
        <div className="cta-text">
          <h2>{heading}</h2>
          {hasText(text) ? (
            <p>
              <RichText value={text} />
            </p>
          ) : null}
        </div>
        <div className="lead-card cta-form">
          <form id="cta-form" data-q3-form="" noValidate suppressHydrationWarning>
            <input className="hp" type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <input type="hidden" name="area" defaultValue="Share your project idea" />
            <div className="lf">
              <label htmlFor="cta-name" data-label="name">
                Name*
              </label>
              <input id="cta-name" name="name" type="text" placeholder="Enter name" autoComplete="name" required />
            </div>
            <div className="lf">
              <label htmlFor="cta-email" data-label="email">
                E-mail*
              </label>
              <input id="cta-email" name="email" type="email" placeholder="Enter email" autoComplete="email" required />
            </div>
            <div className="lf-row">
              <div className="lf">
                <label htmlFor="cta-phone" data-label="mobile number">
                  Mobile number*
                </label>
                <input id="cta-phone" name="phone" type="tel" placeholder="Enter mobile number" autoComplete="tel" inputMode="tel" pattern="[0-9 +\-]{8,20}" required />
              </div>
              <div className="lf">
                <label htmlFor="cta-company" data-label="company name">
                  Company name*
                </label>
                <input id="cta-company" name="company" type="text" placeholder="Enter company name" autoComplete="organization" required />
              </div>
            </div>
            <div className="lf">
              <label htmlFor="cta-msg" data-label="message">
                Message*
              </label>
              <textarea id="cta-msg" name="message" rows={3} placeholder="Enter message" required />
            </div>
            <div className="lead-submit">
              <div className="captcha lf">
                <label htmlFor="cta-cap" data-label="answer">
                  <CaptchaQuestion />
                </label>
                <input id="cta-cap" name="captcha" type="text" inputMode="numeric" autoComplete="off" maxLength={3} placeholder="?" data-captcha="" required aria-label="Security question: what is the sum?" />
              </div>
              <button className="btn btn-primary lead-send" type="submit" suppressHydrationWarning>
                Submit
              </button>
            </div>
            <p className="lead-legal">
              By submitting, you agree to our{' '}
              <a href="https://www.q3tech.com/privacy-policy/" rel="noopener">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="https://www.q3tech.com/cookies-policy/" rel="noopener">
                Cookie Policy
              </a>
              . We will never share your information with third parties.
            </p>
          </form>
          <ThankYouBox message={thanksText || 'Our Australian team will reply within 4 business hours (AEST).'} />
        </div>
      </div>
    </section>
  )
}
