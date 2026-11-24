import type { ReactNode } from 'react'
import { getCaseStudies } from '@/lib/data'
import { shorten } from '@/lib/html'
import { media, mediaSizeUrl, mediaUrl } from '@/lib/media'
import { richTextToHTML } from '@/lib/richtext'
import { siteUrl } from '@/lib/seo'
import type { CaseStudy } from '@/payload-types'
import { ContactBand } from '../sections/ContactBand'
import { HtmlElements } from '../sharedComponent/HtmlElements'
import { Breadcrumb, CaseStudyTile } from '../ui/cards'
import { ArrowIcon } from '../ui/icons'
import { ScriptOwned } from '../ui/ScriptOwned'
import { ShareLinks } from '../ui/ShareLinks'

/** Pick related case studies: the editor's choice, otherwise the ones sharing the most filters. */
async function relatedFor(cs: CaseStudy) {
  const all = await getCaseStudies()
  const picked = (cs.related || []).filter((r): r is CaseStudy => typeof r === 'object' && r !== null)
  if (picked.length) return picked.map((p) => all.find((a) => a.id === p.id) || p)
  const mine = new Set(cs.filters || [])
  return all
    .filter((o) => o.id !== cs.id)
    .map((o) => ({ o, score: (o.filters || []).filter((f) => mine.has(f)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.o)
}

const RichText = ({ value }: { value: unknown }) => <HtmlElements html={richTextToHTML(value, { listClass: 'csd-list' })} />

/** The Outcome: image card with caption and stats, the client quote, and highlight tiles. */
function Outcome({ o }: { o: NonNullable<CaseStudy['outcome']> }) {
  return (
    <div className="csd-outcome">
      <div className="csd-card">
        <div className="csd-card-media">
          <img src={mediaUrl(o.image)} alt={media(o.image)?.alt || ''} width={1000} height={667} loading="lazy" decoding="async" />
        </div>
        {o.caption ? <p className="csd-card-text">{o.caption}</p> : null}
        {o.stats?.length ? (
          <ul className="csd-stats">
            {o.stats.map((s, i) => (
              <li key={s.id || i}>
                <span className="cs-stat-v">{s.value}</span>
                <span className="cs-stat-l">{s.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {o.quote?.text ? (
        <blockquote className="csd-quote">
          <p>{o.quote.text}</p>
          {o.quote.attribution ? <footer>{o.quote.attribution}</footer> : null}
        </blockquote>
      ) : null}
      {o.highlights?.length ? (
        <ul className="csd-tiles">
          {o.highlights.map((h, i) => (
            <li key={h.id || i}>{h.text}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** A case study page (/case-studies/…): hero, banner image, contents with share links, related case studies. */
export async function CaseStudyArticle({ cs }: { cs: CaseStudy }) {
  const hero = media(cs.heroImage)
  const heroSmall = mediaSizeUrl(cs.heroImage, 'w800')
  const o = cs.outcome || {}

  const sections: { id: string; title: string; plain: boolean; content: ReactNode }[] = []
  if (cs.overview) sections.push({ id: 'overview', title: 'Client Overview', plain: true, content: <RichText value={cs.overview} /> })
  if (cs.challenge) sections.push({ id: 'challenge', title: 'The Challenge', plain: true, content: <RichText value={cs.challenge} /> })
  if (cs.solutions) sections.push({ id: 'solutions', title: 'Solutions', plain: true, content: <RichText value={cs.solutions} /> })
  if (o.image || o.caption || o.stats?.length || o.highlights?.length) {
    sections.push({ id: 'outcome', title: 'The Outcome', plain: false, content: <Outcome o={o} /> })
  }
  if (cs.technology?.length) {
    sections.push({
      id: 'technology',
      title: 'Technology Stack',
      plain: false,
      content: (
        <ul className="csd-tech">
          {cs.technology.map((t, i) => (
            <li key={t.id || i}>
              <span className="csd-tech-ico">
                <img decoding="async" src={t.icon || '/assets/icons/case-studies/tech/generic-ai.svg'} alt="" width={30} height={30} loading="lazy" />
              </span>
              {t.name}
            </li>
          ))}
        </ul>
      ),
    })
  }
  const related = await relatedFor(cs)

  return (
    <>
      <section className="csd-hero">
        <div className="wrap">
          <Breadcrumb links={[{ label: 'Case Studies', href: '/case-studies' }]} current={shorten(cs.cardTitle)} />
          {/* The first section's h1: common.min.js splits it into animated lines on load. */}
          <ScriptOwned as="h1">{cs.title}</ScriptOwned>
          <dl className="csd-tags">
            <div>
              <dt>Industry</dt>
              <dd>{cs.industry}</dd>
            </div>
            <div>
              <dt>Services</dt>
              <dd>{cs.services}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="csd-banner-sec">
        <div className="wrap">
          <div className="csd-banner">
            <img
              src={hero?.url || ''}
              {...(heroSmall ? { srcSet: `${heroSmall} 800w, ${hero?.url} 1600w`, sizes: '(max-width: 800px) 100vw, 1600px' } : {})}
              alt={hero?.alt || ''}
              width={1800}
              height={1000}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>
      <section className="csd-body" data-sr-skip="">
        <div className="wrap csd-layout">
          <div className="csd-aside" suppressHydrationWarning>
            <nav className="csd-toc" aria-label="On this page">
              <ol>
                {sections.map((s) => (
                  <li key={s.id}>
                    {/* The script marks the link of the part being read. */}
                    <a href={`#${s.id}`} suppressHydrationWarning>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <ShareLinks url={`${siteUrl()}/case-studies/${cs.slug}`} />
          </div>
          <div className="csd-content">
            {sections.map((s) => (
              <div key={s.id} className={s.plain ? 'csd-block csd-plain' : 'csd-block'} id={s.id}>
                <h2 suppressHydrationWarning>{s.title}</h2>
                {s.content}
              </div>
            ))}
          </div>
        </div>
      </section>
      {related.length ? (
        <section className="section light cs-more">
          <div className="wrap" suppressHydrationWarning>
            <div className="section-head">
              <h2>More Case Studies</h2>
              <a className="btn btn-outline" href="/case-studies">
                View All <ArrowIcon />
              </a>
            </div>
            <div className="cs-grid">
              {related.map((r) => (
                <CaseStudyTile key={r.id} cs={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <ContactBand heading="Want results like these?" text="Tell us what you are working on and we will show you what a first step could look like." />
    </>
  )
}
