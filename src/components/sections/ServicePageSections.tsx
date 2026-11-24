import { media } from '@/lib/media'
import { isExternal } from '../ui/icons'
import { Lines } from '../ui/Lines'
import type { SectionProps } from './types'
import { RichText, hasText } from '../ui/RichText'

const DEFAULT_ITEM_IMAGE = '/assets/images/svc-item-bg.webp'

/**
 * "Services offered (Service page)" (section.services): the numbered list; each item opens to show its text and
 * button. service.min.js ([data-carousel="services"]) opens the items as the visitor scrolls.
 */
export function ServiceOfferings({ block: b }: SectionProps<'serviceOfferings'>) {
  const items = (b.items || []).filter((s) => s.title)
  if (!items.length) return null
  return (
    <section className="services">
      <div className="sec-head">
        <h2>
          <Lines text={b.heading} />
        </h2>
        {hasText(b.intro) ? (
          <p className="sec-head__p" style={{ width: 972 }}>
            <RichText value={b.intro} />
          </p>
        ) : null}
      </div>
      <div className="svc-list" data-carousel="services">
        {items.map((s, i) => {
          const img = media(s.image)
          return (
            <div key={s.id || i} className={i === 0 ? 'svc-item is-active is-open' : 'svc-item'}>
              <img
                decoding="async"
                loading="lazy"
                className="svc-item__img"
                src={img?.url || DEFAULT_ITEM_IMAGE}
                width={img?.width || 600}
                height={img?.height || 374}
                alt=""
              />
              <div className="svc-item__head">
                <h3>{s.title}</h3>
                <span className="svc-item__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="svc-item__panel">
                <div className="svc-item__inner">
                  <p>
                    <RichText value={s.description} />
                  </p>
                  {s.buttonLink ? (
                    <a className="btn btn--white" href={s.buttonLink} rel={isExternal(s.buttonLink) ? 'noopener' : undefined}>
                      <span>{s.buttonLabel || 'Explore More'}</span>
                      <span className="btn__icon">
                        <img decoding="async" loading="lazy" src="/assets/icons/common/arrow-black.svg" width={20} height={20} alt="" />
                      </span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** From the 4th step the title gets a fixed height, so the descriptions line up across the row (as designed). */
const FIXED_TITLE_FROM = 3
/** Steps highlighted before the script runs (it then highlights the ones in view). */
const LIT_AT_START = 4

/**
 * "Delivery process (Service page)" (section.process): numbered steps in a row that service.min.js scrolls sideways
 * as the page scrolls ([data-hscroll="process"]), highlighting the steps in view (is-lit).
 */
export function ServiceProcess({ block: b }: SectionProps<'serviceProcess'>) {
  const steps = (b.steps || []).filter((s) => s.title)
  if (!steps.length) return null
  return (
    <section className="process" data-hscroll="process">
      <div className="process__pin">
        <div className="process__head">
          <h2>{b.heading}</h2>
          {hasText(b.intro) ? (
            <p>
              <RichText value={b.intro} />
            </p>
          ) : null}
        </div>
        <div className="process__row" tabIndex={0} role="region" aria-label="Process steps">
          {steps.map((s, i) => {
            const img = media(s.image)
            return (
              <div key={s.id || i} className={i < LIT_AT_START ? 'step is-lit' : 'step'}>
                <div className="step__media" aria-hidden="true">
                  {img?.url ? <img decoding="async" width={img.width || 460} height={img.height || 400} src={img.url} alt="" loading="lazy" /> : null}
                </div>
                <p className="step__n">{i + 1}</p>
                <div className="step__body">
                  <div className={i >= FIXED_TITLE_FROM ? 'step__title step__title--fixed' : 'step__title'}>
                    <h3>
                      <Lines text={s.title} />
                    </h3>
                  </div>
                  <p className="step__desc">
                    <RichText value={s.description} />
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
