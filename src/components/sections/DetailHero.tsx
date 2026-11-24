import { Fragment, type CSSProperties } from 'react'
import { media } from '@/lib/media'
import { ArrowSmallIcon, ArrowWhite } from '../ui/icons'
import { Breadcrumb } from '../ui/cards'
import { ScriptOwned } from '../ui/ScriptOwned'
import type { BlockOf, SectionProps } from './types'
import { RichText } from '../ui/RichText'

type Hero = BlockOf<'detailHero'>
type Button = NonNullable<Hero['buttons']>[number]

const lines = (title: string | null | undefined) =>
  (title || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

/** Breadcrumb's last item: the "Breadcrumb name", or the title on one line. */
const crumbOf = (b: Hero) => b.breadcrumbLabel || (b.title || '').replace(/\s+/g, ' ').trim()

/**
 * The page heading with its line breaks. Script-owned: when the hero is the first section, common.min.js splits it
 * into animated lines on load.
 */
const Title = ({ text, id }: { text: string | null | undefined; id?: string }) => (
  <ScriptOwned as="h1" id={id}>
    {lines(text).map((l, i) => (
      <Fragment key={i}>
        {i ? <br /> : null}
        {l}
      </Fragment>
    ))}
  </ScriptOwned>
)

/** The hero image, with its 800px version for small screens when Media has one. */
function heroImage(b: Hero, sizes: (w: number) => string) {
  const img = media(b.image)
  if (!img?.url) return null
  const w = img.width || 1440
  const small = img.sizes?.w800?.url
  return {
    src: img.url,
    alt: img.alt || '',
    width: w,
    height: img.height || 880,
    ...(small && w > 800 ? { srcSet: `${small} 800w, ${img.url} ${w}w`, sizes: sizes(w) } : {}),
  }
}

const cta = (btn: Button) => btn.trackingId || undefined

/** Service page design (section.hero#top): image beside the text, stats, buttons. */
function ServiceHero({ block: b }: { block: Hero }) {
  const img = heroImage(b, (w) => `(max-width: 800px) 100vw, ${w}px`)
  const stats = (b.stats || []).filter((s) => s.value || s.label)
  const buttons = b.buttons || []
  return (
    <section className="hero" id="top">
      <Breadcrumb className="breadcrumb hero__crumbs" links={[{ label: 'Services', href: '/services' }]} current={crumbOf(b)} />
      <div className="hero__bg" aria-hidden="true" />
      {img ? (
        <div className="hero__media">
          <img fetchPriority="high" {...img} alt={img.alt} />
        </div>
      ) : null}
      <div className="hero__content">
        <div className="hero__text">
          <Title text={b.title} />
          <p>
            <RichText value={b.description} />
          </p>
        </div>
        {stats.length ? (
          <div className="stats">
            {stats.map((s, i) => (
              <div key={s.id || i} className="stat">
                <div className="stat__body">
                  <div className="stat__num">
                    <div className="stat__n stat__n--auto">
                      <p>{s.value}</p>
                    </div>
                    <div className="stat__suf">
                      <p>{s.suffix}</p>
                    </div>
                  </div>
                  <p className="stat__label">{s.label}</p>
                  {i < stats.length - 1 ? (
                    <img decoding="async" loading="lazy" className="stat__div" src="/assets/icons/common/stat-divider.svg" width={1} height={44} alt="" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {buttons.length ? (
          <div className="hero__btns">
            {buttons.map((btn, i) => (
              <a key={btn.id || i} className={`btn ${btn.style === 'outline' ? 'btn--outline-white' : 'btn--primary'}`} href={btn.link} data-cta={cta(btn)}>
                <span>{btn.label}</span>
                <span className="btn__icon">
                  <ArrowWhite />
                </span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** Industry detail design (section.ind-hero): heading, text and buttons over a wide image. */
function IndustryHero({ block: b }: { block: Hero }) {
  const img = heroImage(b, () => '100vw')
  const buttons = b.buttons || []
  return (
    <section className="ind-hero" aria-labelledby="ind-hero-title">
      <div className="ind-hero__in">
        <Breadcrumb links={[{ label: 'Industries', href: '/industries' }]} current={crumbOf(b)} />
        <div className="ind-hero__top">
          <Title text={b.title} id="ind-hero-title" />
          <div className="ind-hero__side">
            <p>
            <RichText value={b.description} />
          </p>
            {buttons.length ? (
              <div className="ind-hero__btns">
                {buttons.map((btn, i) => (
                  <a key={btn.id || i} className={`ind-btn ${btn.style === 'outline' ? 'ind-btn--ghost' : 'ind-btn--primary'}`} href={btn.link} data-cta={cta(btn)}>
                    {btn.label} <ArrowSmallIcon />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {img ? (
          <figure className="ind-hero__media">
            <img {...img} alt={img.alt} fetchPriority="high" />
          </figure>
        ) : null}
      </div>
    </section>
  )
}

/**
 * Services overview design (/services, section.hero in services.min.css): heading lines that animate in
 * (span.line), text and buttons over a background photo; no stats. The photo comes from the stylesheet
 * (.hero:before); an image chosen in the section replaces it through the --hero-bg variable, keeping the
 * stylesheet's position, size and mirroring.
 */
function ServicesOverviewHero({ block: b }: { block: Hero }) {
  const bg = media(b.image)?.url
  const buttons = b.buttons || []
  return (
    <section
      className="hero"
      aria-labelledby="hero-title"
      {...(bg ? { 'data-bg': '', style: { '--hero-bg': `url('${encodeURI(bg)}')` } as CSSProperties } : {})}
    >
      {bg ? <style dangerouslySetInnerHTML={{ __html: '.hero[data-bg]:before{background-image:var(--hero-bg)}' }} /> : null}
      <Breadcrumb className="breadcrumb hero__crumbs" current={crumbOf(b)} />
      <div className="hero__in">
        <div className="hero__text">
          <h1 id="hero-title">
            {lines(b.title).map((l, i) => (
              <span key={i} className="line">
                <span>{l}</span>
              </span>
            ))}
          </h1>
          <p>
            <RichText value={b.description} />
          </p>
        </div>
        {buttons.length ? (
          <div className="hero__btns">
            {buttons.map((btn, i) => (
              <a key={btn.id || i} className={`ui-btn ${btn.style === 'outline' ? 'ui-btn--ghost' : 'ui-btn--primary'}`} href={btn.link} data-cta={cta(btn)}>
                {btn.label} <ArrowWhite priority={i === 0} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** "Hero banner" (src/blocks/detail), drawn in the design of the page Template. */
export function DetailHero({ block, template }: SectionProps<'detailHero'>) {
  if (template === 'services') return <ServicesOverviewHero block={block} />
  if (template === 'industryDetail') return <IndustryHero block={block} />
  return <ServiceHero block={block} />
}
