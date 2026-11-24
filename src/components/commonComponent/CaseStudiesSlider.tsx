import { caseStudiesForSlider } from '@/lib/commonComponents'
import { media } from '@/lib/media'
import type { CaseStudiesSliderBlock } from '@/payload-types'
import { ArrowIcon, NextIcon, PrevIcon } from '../ui/icons'

type Props = {
  /** The "Case studies slider" section from the CMS: heading, picked case studies, View All link, autoplay. */
  block: Pick<CaseStudiesSliderBlock, 'heading' | 'caseStudies' | 'limit' | 'viewAllLabel' | 'viewAllLink' | 'autoplay'>
  /** Optional id on the <section>, so links can jump here. */
  anchorId?: string | null
}

/**
 * Case studies carousel (section.cs-story-sec), rendered from the CMS:
 *  - the section settings (heading, View All link, autoplay) come from the "Case studies slider" section;
 *  - each card comes from the Case studies collection (card tag, card title, card or hero image, the first two
 *    outcome stats and the link). Only published case studies show, in the order picked; with none picked, the
 *    first `limit` ones.
 * Markup and class names match the original site, so the existing CSS and slider script (data-tq-*) drive it.
 */
export async function CaseStudiesSlider({ block, anchorId }: Props) {
  const studies = await caseStudiesForSlider(block)
  if (!studies.length) return null

  return (
    <section className="cs-story-sec" aria-labelledby="cs-story-title" id={anchorId || undefined}>
      {/* suppressHydrationWarning, here and below: the site scripts change these elements on load, before React
          hydrates. The scroll reveal (common.min.js) adds `sr` classes and a --sr-delay style to .wrap and .tq-row,
          and the slider script (main.min.js) disables the arrow buttons at either end. It only covers each
          element's own attributes, not its children. */}
      <div className="wrap" suppressHydrationWarning>
        <div className="cs-story-head">
          <h2 id="cs-story-title">{block.heading || 'Case Studies'}</h2>
          <div className="cs-story-actions">
            {block.viewAllLink ? (
              <a className="btn btn-outline cs-story-all" href={block.viewAllLink}>
                {block.viewAllLabel || 'View All'} <ArrowIcon />
              </a>
            ) : null}
            <div className="cs-arrows">
              <button type="button" className="blog-arrow" data-tq-prev="" aria-label="Previous case study" suppressHydrationWarning>
                <PrevIcon />
              </button>
              <button type="button" className="blog-arrow" data-tq-next="" aria-label="Next case study" suppressHydrationWarning>
                <NextIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="tq-row cs-story-row"
        data-tq-row=""
        data-tq-autoplay={block.autoplay === false ? undefined : '6000'}
        data-tq-start="1"
        suppressHydrationWarning
      >
        {studies.map((cs) => {
          const img = media(cs.cardImage) || media(cs.heroImage)
          const stats = (cs.outcome?.stats || []).slice(0, 2)
          return (
            <article key={cs.id} className="cs-story" aria-label={cs.cardTag || cs.cardTitle}>
              <div className="cs-story-media">
                {cs.cardTag ? <p className="cs-story-cat">{cs.cardTag}</p> : null}
                {img?.url ? (
                  <img
                    className="cs-story-fill"
                    src={img.url}
                    alt=""
                    width={img.width || 768}
                    height={img.height || 576}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span className="cs-story-overlay" aria-hidden="true" />
              </div>
              <div className="cs-story-content">
                <p className="cs-story-headline">{cs.cardTitle}</p>
                <div className="cs-story-bottom">
                  {stats.length ? (
                    <div className="cs-story-stats">
                      {stats.map((s, i) => (
                        <div key={s.id || i} className="cs-story-stat">
                          <span className="cs-stat-v">{s.value}</span>
                          <span className="cs-stat-l">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <a className="btn btn-outline cs-story-link" href={`/case-studies/${cs.slug}`}>
                    Read Story <ArrowIcon />
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
