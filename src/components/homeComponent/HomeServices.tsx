import { media } from '@/lib/media'
import { ArrowIcon, isExternal } from '../ui/icons'
import type { SectionProps } from '../sections/types'
import { RichText } from '../ui/RichText'

const HeadArrow = () => (
  <svg
    className="wd-arrow"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export function HomeServices({ block }: SectionProps<'homeServices'>) {
  const services = block.services || []
  if (!services.length) return null

  return (
    <section className="svc-wd" aria-labelledby="svc-wd-title">
      <div className="wrap">
        <div className="wd-head-row" suppressHydrationWarning>
          <h2 id="svc-wd-title">{block.heading}</h2>
          {block.viewAllLink ? (
            <a className="btn btn-outline wd-viewall" href={block.viewAllLink}>
              {block.viewAllLabel || 'View All'} <ArrowIcon />
            </a>
          ) : null}
        </div>
        <div className="wd-grid" suppressHydrationWarning>
          <div className="wd-main">
            <ol className="wd-list" data-wd-list="">
              {services.map((s, i) => {
                const open = i === 0
                const subs = s.subServices || []
                return (
                  <li
                    key={s.id || i}
                    className={open ? 'wd-item is-open' : 'wd-item'}
                    data-wd=""
                    suppressHydrationWarning
                  >
                    <button
                      className="wd-head"
                      type="button"
                      id={`wd-h-${i}`}
                      aria-expanded={open ? 'true' : 'false'}
                      aria-controls={`wd-p-${i}`}
                      suppressHydrationWarning
                    >
                      <span className="wd-t">{s.title}</span>
                      <HeadArrow />
                    </button>
                    <div
                      className="wd-panel"
                      id={`wd-p-${i}`}
                      role="region"
                      aria-labelledby={`wd-h-${i}`}
                    >
                      <div className="wd-in">
                        <div className="wd-text">
                          <p>
                            <RichText value={s.description} />
                          </p>
                          {s.link ? (
                            <a className="wd-link" href={s.link}>
                              {s.linkLabel || `Explore ${s.title}`} <ArrowIcon />
                            </a>
                          ) : null}
                        </div>
                        {subs.length ? (
                          <ul className="wd-subs">
                            {subs.map((sub, j) => (
                              <li key={sub.id || j}>
                                <a
                                  href={sub.url}
                                  rel={isExternal(sub.url) ? 'noopener' : undefined}
                                >
                                  {sub.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
          <div className="wd-media">
            <div className="wd-clip">
              {services.map((s, i) => {
                const img = media(s.image)
                if (!img?.url) return null
                return (
                  <img
                    key={s.id || i}
                    className={i === 0 ? 'wd-img is-on' : 'wd-img'}
                    data-wd-img={String(i)}
                    src={img.url}
                    alt=""
                    width={img.width || 760}
                    height={img.height || 1086}
                    loading="lazy"
                    decoding="async"
                    suppressHydrationWarning
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
