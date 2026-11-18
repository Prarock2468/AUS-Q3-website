import { media } from '@/lib/render/parts'
import { ArrowIcon, isExternal } from './icons'
import type { SectionProps } from './types'

/**
 * "Industries We Serve" on the home page (section.industries-section), from the "Industries we serve (home page)"
 * section in the CMS: heading and View all button, then one tab per industry with its image, text and link.
 * The first industry starts selected.
 *
 * Markup, class names and data-ind-* attributes match the original site, so the existing CSS and the home script
 * (main.min.js: switches tabs, moves the droplet indicator and background, sets the section colours) drive it.
 */
export function HomeIndustries({ block }: SectionProps<'homeIndustries'>) {
  const industries = block.industries || []
  if (!industries.length) return null

  // suppressHydrationWarning below: the site scripts change these elements' own attributes on load, before React
  // hydrates (scroll reveal classes, the selected tab, indicator/background position and the section colours).
  return (
    <section className="section alt industries-section" suppressHydrationWarning>
      <div className="wrap">
        <div className="section-head" suppressHydrationWarning>
          <div>
            <h2>{block.heading}</h2>
          </div>
          {block.viewAllLink ? (
            <a className="btn btn-outline" href={block.viewAllLink}>
              {block.viewAllLabel || 'View all'} <ArrowIcon />
            </a>
          ) : null}
        </div>
        <div className="ai-tab-wrap" data-ind-tabs="" suppressHydrationWarning>
          <div className="hero-sticky" suppressHydrationWarning>
            <div className="tabs-wrapper" role="tablist" aria-label="Industries we serve" suppressHydrationWarning>
              <span className="droplet-indicator" aria-hidden="true" suppressHydrationWarning />
              {industries.map((ind, i) => (
                <button
                  key={ind.id || i}
                  type="button"
                  className={i === 0 ? 'tab-btn is-on' : 'tab-btn'}
                  role="tab"
                  data-ind-tab={String(i)}
                  aria-selected={i === 0 ? 'true' : 'false'}
                  suppressHydrationWarning
                >
                  {ind.title}
                </button>
              ))}
            </div>
            <div className="hero-stage" suppressHydrationWarning>
              <span className="card-bg-mesh" aria-hidden="true" suppressHydrationWarning />
              <div className="tab-slides">
                {industries.map((ind, i) => {
                  const img = media(ind.image)
                  const w800 = img?.sizes?.w800?.url
                  const srcSet = img?.url && w800 && (img.width || 0) > 800 ? `${w800} 800w, ${img.url} ${img.width}w` : undefined
                  return (
                    <div
                      key={ind.id || i}
                      className={i === 0 ? 'tab-slide is-on' : 'tab-slide'}
                      role="tabpanel"
                      aria-label={ind.title}
                      suppressHydrationWarning
                    >
                      <div className="slide-media">
                        {img?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- same markup as the original site
                          <img
                            src={img.url}
                            srcSet={srcSet}
                            sizes={srcSet ? '(max-width: 800px) 100vw, 1200px' : undefined}
                            alt=""
                            width={img.width || 768}
                            height={img.height || 401}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </div>
                      <div className="slide-copy">
                        <h3>{ind.title}</h3>
                        <p>{ind.description}</p>
                        {ind.link ? (
                          <a
                            className="btn btn-outline"
                            href={ind.link}
                            rel={isExternal(ind.link) ? 'noopener' : undefined}
                            aria-label={`Know more about ${ind.title}`}
                          >
                            {ind.linkLabel || 'Know More'} <ArrowIcon />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
