import { media } from '@/lib/media'
import { ArrowWhite } from '../ui/icons'
import type { SectionProps } from './types'
import { RichText } from '../ui/RichText'

/** The decorative ruler beside the list has a fixed number of ticks, as on the original page. */
const RULER_TICKS = 81

function ServiceImage({ file, className, eager }: { file: unknown; className: string; eager: boolean }) {
  const m = media(file)
  if (!m?.url) return null
  return (
    <img
      width={m.width || 760}
      height={m.height || 1086}
      className={className}
      src={m.url}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      suppressHydrationWarning
    />
  )
}

/**
 * "Our Services" on the Services page (section.svc.road inside div.svc-pin), from the "Our services (Services page)"
 * section. Same markup and class names as the original page: /js/templates/services.min.js pins the section, opens
 * the services as you scroll or click (road__item / road__head) and swaps the images (road__img); the elements it
 * changes are marked suppressHydrationWarning.
 */
export function ServicesList({ block: b }: SectionProps<'servicesList'>) {
  const services = (b.services || []).filter((s) => s.title)
  if (!services.length) return null
  return (
    <div className="svc-pin" data-svc-pin="" suppressHydrationWarning>
      <section className="svc road" aria-labelledby="svc-title" suppressHydrationWarning>
        <h2 id="svc-title">{b.heading || 'Our Services'}</h2>
        <div className="road__grid" data-road="">
          <div className="road__ruler" aria-hidden="true">
            <div className="road__tape" suppressHydrationWarning>
              {Array.from({ length: RULER_TICKS }, (_, i) => (
                <span key={i} suppressHydrationWarning />
              ))}
            </div>
          </div>
          <div className="road__window">
            <ol className="road__list" suppressHydrationWarning>
              {services.map((s, i) => {
                const n = i + 1
                const pills = (s.subServices || []).filter((p) => p.label)
                return (
                  <li key={s.id || i} className={i === 0 ? 'road__item is-on' : 'road__item'} suppressHydrationWarning>
                    <button className="road__head" type="button" aria-controls={`road-more-${n}`} suppressHydrationWarning>
                      <span className="road__num">{String(n).padStart(2, '0')}</span>
                      <span className="road__title">{s.title}</span>
                    </button>
                    <div className="road__more" id={`road-more-${n}`} suppressHydrationWarning>
                      <div className="road__more-in">
                        <ServiceImage file={s.image} className="road__thumb" eager={false} />
                        <p>
                          <RichText value={s.description} />
                        </p>
                        {pills.length ? (
                          <ul className="road__pills">
                            {pills.map((p, j) => (
                              <li key={p.id || j}>{p.url ? <a href={p.url}>{p.label}</a> : p.label}</li>
                            ))}
                          </ul>
                        ) : null}
                        {s.buttonLink ? (
                          <a className="ui-btn ui-btn--primary" href={s.buttonLink}>
                            {s.buttonLabel || 'Explore More'} <ArrowWhite />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
          <div className="road__media" aria-hidden="true">
            {services.map((s, i) => (
              <ServiceImage key={s.id || i} file={s.image} className={i === 0 ? 'road__img is-on' : 'road__img'} eager={i === 0} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
