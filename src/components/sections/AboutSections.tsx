import { Fragment } from 'react'
import { media } from '@/lib/media'
import type { SectionProps } from './types'
import { RichText } from '../ui/RichText'

const DEFAULT_ICON = '/assets/icons/recognition-default.svg'

/**
 * "About us (statement)" on the About page, in the About design (section.ab-statement, "Q3 at a glance"): the
 * statement split into words, which about.min.js lights up on scroll ([data-statement] .w), and the stats. Buttons
 * are a Home design feature and are not shown here. (On Home the same section is components/homeComponent/HomeAbout.)
 */
export function AboutStatement({ block: b }: SectionProps<'homeAbout'>) {
  const words = (b.statement || '').split(/\s+/).filter(Boolean)
  if (!words.length) return null
  const stats = (b.stats || []).filter((s) => s.value || s.label)
  return (
    <section className="ab-statement" aria-label="Q3 at a glance">
      <div className="ab-wrap">
        <p data-statement="" suppressHydrationWarning>
          {words.map((w, i) => (
            <Fragment key={i}>
              {i ? ' ' : null}
              {/* The script adds `lit` as the visitor scrolls (possibly before React hydrates). */}
              <span className="w" suppressHydrationWarning>
                {w}
              </span>
            </Fragment>
          ))}
        </p>
        {stats.length ? (
          <ul className="ab-recstats" aria-label="Q3 in numbers">
            {stats.map((s, i) => (
              <li key={s.id || i} className="ab-recstat">
                <img decoding="async" src={media(s.icon)?.url || DEFAULT_ICON} alt="" width={80} height={44} loading="lazy" />
                <p className="ab-recstat__n">{s.value}</p>
                <p>{s.label}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

/**
 * "Our story (timeline)" on the About page ("Championing Quality, Shaping Tomorrow"): milestone cards and the year
 * buttons under them. about.min.js pins the section, scrolls the cards and links them to the buttons
 * ([data-story-pin], [data-story], .story-year[data-story="i"]); suppressHydrationWarning marks the elements whose
 * classes and styles it changes.
 */
export function AboutStory({ block: b }: SectionProps<'aboutStory'>) {
  const items = (b.milestones || []).filter((m) => m.year || m.title)
  if (!items.length) return null
  // Card ids come from the year ("story-1996"); a repeated year gets the card number added so ids stay unique.
  const seen = new Set<string>()
  const ids = items.map((m, i) => {
    const base = `story-${String(m.year || i + 1).trim().replace(/[^\w-]+/g, '-')}`
    const id = seen.has(base) ? `${base}-${i + 1}` : base
    seen.add(id)
    return id
  })
  return (
    <div className="ab-story-pin" data-story-pin="" suppressHydrationWarning>
      <section className="ab-story" aria-labelledby="ab-story-title" data-story="" suppressHydrationWarning>
        <div className="ab-head">
          {b.eyebrow ? <p className="ab-eyebrow">{b.eyebrow}</p> : null}
          <h2 id="ab-story-title">{b.heading}</h2>
        </div>
        <div className="ab-story__track" tabIndex={0} aria-label="Q3 Technologies timeline" suppressHydrationWarning>
          <ol className="ab-story__cards" suppressHydrationWarning>
            {items.map((m, i) => {
              const img = media(m.image)
              return (
                <li key={m.id || i} className="story-card" id={ids[i]} aria-label={m.year} suppressHydrationWarning>
                  <img decoding="async" width={img?.width || 1000} height={img?.height || 666} className="story-card__img" src={img?.url || ''} alt="" loading="lazy" />
                  <div className="story-card__body">
                    <p className="story-card__year">{m.year}</p>
                    <div>
                      <h3>{m.title}</h3>
                      <p>
                        <RichText value={m.description} />
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
        <ol className="ab-story__years" aria-label="Jump to year">
          {items.map((m, i) => (
            <li key={m.id || i}>
              <button
                className={i === 0 ? 'story-year is-active' : 'story-year'}
                type="button"
                data-story={i}
                aria-controls={ids[i]}
                aria-current={i === 0 ? 'true' : undefined}
                suppressHydrationWarning
              >
                <span>{m.year}</span>
                <img decoding="async" loading="lazy" className="story-year__dot" src="/assets/icons/about/dot.svg" alt="" width={16} height={16} />
                <img decoding="async" loading="lazy" className="story-year__dot story-year__dot--on" src="/assets/icons/about/dot-active.svg" alt="" width={16} height={16} />
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
