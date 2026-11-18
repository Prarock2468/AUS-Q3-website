import { media } from '@/lib/render/parts'
import { Buttons } from './Buttons'
import type { SectionProps } from './types'

/**
 * Home hero (section.home-hero), from the "Hero (home page)" section in the CMS: badges, the h1, intro, buttons,
 * and the background video over its poster image.
 *
 * The poster is preloaded (a <link> React moves into <head>) because it is the largest thing on screen at load.
 * The video sources use data-src: the home script (main.min.js) loads them once the page is idle, and skips them
 * for reduced motion or save-data. Markup and class names match the original site, so the existing CSS and
 * scripts drive it.
 */
export function HomeHero({ block }: SectionProps<'homeHero'>) {
  const poster = media(block.poster)?.url || undefined
  const webm = media(block.videoWebm)?.url || undefined
  const mp4 = media(block.videoMp4)?.url || undefined

  const badges = block.badges || []
  const buttons = block.buttons || []

  // suppressHydrationWarning below: the site scripts change these elements' own attributes before React hydrates
  // (video sources get their src; the intro and buttons get inline styles). <Buttons> is shared with HomeAbout.
  return (
    <section className="home-hero" aria-labelledby="hero-title">
      {/* React moves this <link> into <head>. (ReactDOM.preload only reaches the client data, too late to help.) */}
      {poster ? <link rel="preload" as="image" href={poster} fetchPriority="high" /> : null}
      <div className="hero-card">
        {/* The poster is also the background, shown when there is no video or it is hidden for reduced motion. */}
        <div className="hero-media" aria-hidden="true" style={poster ? { backgroundImage: `url("${poster}")` } : undefined}>
          {webm || mp4 ? (
            <video autoPlay muted loop playsInline preload="none" poster={poster} data-hero-video="" suppressHydrationWarning>
              {webm ? <source data-src={webm} type="video/webm; codecs=vp9" suppressHydrationWarning /> : null}
              {mp4 ? <source data-src={mp4} type="video/mp4" suppressHydrationWarning /> : null}
            </video>
          ) : null}
        </div>
        <div className="wrap">
          {badges.length ? (
            <ul className="hero-stats" aria-label="Q3 at a glance">
              {badges.map((b, i) => (
                <li key={b.id || i}>
                  {b.icon ? (
                    <span className="pill-emoji" aria-hidden="true">
                      {b.icon}
                    </span>
                  ) : null}
                  <strong>{b.highlight}</strong>
                  {b.text ? ` ${b.text}` : null}
                </li>
              ))}
            </ul>
          ) : null}
          <h1 id="hero-title">{block.heading}</h1>
          <div className="hero-bottom">
            {block.intro ? (
              <p className="lede" suppressHydrationWarning>
                {block.intro}
              </p>
            ) : null}
            {buttons.length ? (
              <div className="actions" suppressHydrationWarning>
                <Buttons buttons={buttons} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
