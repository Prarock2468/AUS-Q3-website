import { Fragment } from 'react'
import { media } from '@/lib/media'
import { Buttons } from './Buttons'
import type { SectionProps } from '../sections/types'

const DEFAULT_ICON = '/assets/icons/recognition-default.svg'

/**
 * "About Q3" on the home page (section.statement), from the "About us (home page)" section in the CMS: the
 * statement, buttons and stat cards.
 *
 * Each word of the statement is its own span.w; the home script (main.min.js, [data-statement]) lights them up in
 * turn on scroll by toggling the `lit` class. Markup and class names match the original site.
 */
export function HomeAbout({ block }: SectionProps<'homeAbout'>) {
  const words = (block.statement || '').split(/\s+/).filter(Boolean)
  const buttons = block.buttons || []
  const stats = block.stats || []

  return (
    <section className="statement" aria-label="About Q3">
      <div className="wrap">
        <p data-statement="">
          {words.map((w, i) => (
            // suppressHydrationWarning: the script may add `lit` before React hydrates.
            <Fragment key={i}>
              {i ? ' ' : null}
              <span className="w" suppressHydrationWarning>
                {w}
              </span>
            </Fragment>
          ))}
        </p>
        {buttons.length ? (
          <div className="meta-row">
            <Buttons buttons={buttons} />
          </div>
        ) : null}
        {stats.length ? (
          <ul className="recstat-grid" aria-label="Recognition and reviews">
            {stats.map((s, i) => (
              <li key={s.id || i} className="recstat">
                <span className="recstat-badge">
                  <img
                    decoding="async"
                    className="recstat-ico recstat-ico-img"
                    src={media(s.icon)?.url || DEFAULT_ICON}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                  />
                </span>
                <span className="recstat-num">{s.value}</span>
                <span className="recstat-label">{s.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
