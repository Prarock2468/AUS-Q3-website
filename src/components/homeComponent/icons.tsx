/** Small icons shared by the home sections (same SVG as the original site). */

/** Arrow used in buttons and links (class "ico"). */
export const ArrowIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

/** True for links to another site (they get rel="noopener", like the original site). */
export const isExternal = (url: string) => /^https?:\/\//i.test(url)
