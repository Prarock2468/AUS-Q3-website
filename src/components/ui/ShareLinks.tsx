/** "Share" links (LinkedIn, Facebook, X, copy link) beside a case study. The copy button is wired by the template script. */
export function ShareLinks({ url: u, className = 'csd-share' }: { url: string; className?: string }) {
  return (
    <div className={className}>
      <span>Share</span>
      <a data-share="linkedin" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener" aria-label="Share on LinkedIn">
        <svg viewBox="10 10 20 20" aria-hidden="true">
          <path
            d="M15.0219 13.7002C15.0216 14.4331 14.577 15.0926 13.8977 15.3677C13.2184 15.6429 12.4402 15.4787 11.9299 14.9527C11.4196 14.4266 11.2792 13.6437 11.5749 12.9732C11.8706 12.3026 12.5434 11.8782 13.2759 11.9002C14.2489 11.9294 15.0224 12.7268 15.0219 13.7002ZM15.0759 16.8322H11.4759V28.1002H15.0759V16.8322ZM20.7639 16.8322H17.1819V28.1002H20.7279V22.1872C20.7279 18.8932 25.0209 18.5872 25.0209 22.1872V28.1002H28.5759V20.9632C28.5759 15.4102 22.2219 15.6172 20.7279 18.3442L20.7639 16.8322Z"
            fill="currentColor"
          />
        </svg>
      </a>
      <a data-share="facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener" aria-label="Share on Facebook">
        <svg viewBox="10 10 20 20" aria-hidden="true">
          <path
            d="M21.8039 21.3471H24.0539L24.9539 17.7471H21.8039V15.9471C21.8039 15.0206 21.8039 14.1471 23.6039 14.1471H24.9539V11.1232C24.6608 11.0842 23.5526 10.9971 22.3825 10.9971C19.9395 10.9971 18.2039 12.4882 18.2039 15.2268V17.7471H15.5039V21.3471H18.2039V28.9971H21.8039V21.3471Z"
            fill="currentColor"
          />
        </svg>
      </a>
      <a data-share="x" href={`https://twitter.com/intent/tweet?url=${u}`} target="_blank" rel="noopener" aria-label="Share on X">
        <svg viewBox="10 10 20 20" aria-hidden="true">
          <path
            d="M25.5839 11.2314H28.5611L22.0568 18.6654L29.7086 28.7814H23.7173L19.0247 22.6461L13.6554 28.7814H10.6764L17.6334 20.8299L10.293 11.2314H16.4364L20.678 16.8393L25.5839 11.2314ZM24.539 26.9994H26.1887L15.54 12.9198H13.7697L24.539 26.9994Z"
            fill="currentColor"
          />
        </svg>
      </a>
      <button type="button" data-copy="" aria-label="Copy link">
        <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
        </svg>
      </button>
    </div>
  )
}
