/** Icons used across the site (same SVG as the original markup). */

/** Arrow used in buttons and links (class "ico"). */
export const ArrowIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

/** Small up-right arrow of the Industry page buttons. */
export const ArrowSmallIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M6 14L14 6M7 6h7v7" />
  </svg>
)

/** The white arrow image used on the Services, Service and About page buttons. */
export const ArrowWhite = ({ priority = false }: { priority?: boolean }) =>
  priority ? (
    <img fetchPriority="high" src="/assets/icons/about/arrow-white.svg" alt="" width={20} height={20} />
  ) : (
    <img decoding="async" loading="lazy" src="/assets/icons/about/arrow-white.svg" alt="" width={20} height={20} />
  )

export const PrevIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)

export const NextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const CalendarIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)

export const TickIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m5 12 5 5 9-10" />
  </svg>
)

/* Lucide icons, as on the original Contact Us page and insight articles. */
const Lucide = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <svg
    className={`lucide ${name}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
)

const PHONE_PATH =
  'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384'

export const MailIcon = () => (
  <Lucide name="lucide-mail">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Lucide>
)
export const PhoneIcon = ({ small = false }: { small?: boolean }) => (
  <Lucide name={small ? 'lucide-phone git-ph-ico' : 'lucide-phone'}>
    <path d={PHONE_PATH} />
  </Lucide>
)
export const WhatsAppIcon = () => (
  <Lucide name="lucide-message-circle git-ph-ico git-wa">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </Lucide>
)
export const CheckIcon = () => (
  <Lucide name="lucide-circle-check git-check">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </Lucide>
)
export const UploadIcon = () => (
  <Lucide name="lucide-upload">
    <path d="M12 3v12" />
    <path d="m17 8-5-5-5 5" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </Lucide>
)
export const ShieldIcon = () => (
  <Lucide name="lucide-shield-check">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Lucide>
)
export const StarIcon = () => (
  <Lucide name="lucide-star">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Lucide>
)

/** True for links to another site (they get rel="noopener", like the original site). */
export const isExternal = (url: string) => /^https?:\/\//i.test(url)
