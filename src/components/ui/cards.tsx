import { author as authorOf, mediaUrl } from '@/lib/media'
import type { CaseStudy, Insight, SiteSetting } from '@/payload-types'
import { ArrowIcon, CalendarIcon } from './icons'

/** A case study tile in the case study grids (section.list-sec, "More Case Studies"). */
export function CaseStudyTile({ cs, priority = false }: { cs: CaseStudy; priority?: boolean }) {
  const img = mediaUrl(cs.cardImage) || mediaUrl(cs.heroImage)
  return (
    <a className="cs-tile" href={`/case-studies/${cs.slug}`} data-tags={(cs.filters || []).join(' ')}>
      <div className="cs-tile-media">
        <img src={img} alt="" width={960} height={720} {...(priority ? { fetchPriority: 'high' } : { loading: 'lazy' })} decoding="async" />
        <span className="cs-tile-tag">{cs.cardTag}</span>
      </div>
      <div className="cs-tile-body">
        <h4 aria-level={3}>{cs.cardTitle}</h4>
        <span className="btn btn-outline cs-tile-btn">
          View Case Study <ArrowIcon />
        </span>
      </div>
    </a>
  )
}

/** Author photo, name and role under an insight card or title. */
export function Byline({ author, className = 'blog-by', size = 34 }: { author: unknown; className?: string; size?: number }) {
  const a = authorOf(author)
  if (!a) return null
  return (
    <p className={className}>
      <img className="blog-ini" src={mediaUrl(a.photo)} alt="" width={size} height={size} loading="lazy" decoding="async" />
      <span>
        <strong>{a.name}</strong> <em>{a.role}</em>
      </span>
    </p>
  )
}

/** An insight card (blog grids and rows). `filter`: the data-* attributes the insights filter reads. */
export function BlogCard({ post, priority = false, filter }: { post: Insight; priority?: boolean; filter?: Record<string, string> }) {
  const href = `/insights/${post.slug}`
  const img = mediaUrl(post.cardImage) || mediaUrl(post.coverImage)
  return (
    <article className="blog-card" {...filter}>
      <a className="blog-img" href={href} tabIndex={-1} aria-hidden="true">
        <img src={img} alt="" width={768} height={538} {...(priority ? { fetchPriority: 'high' } : { loading: 'lazy' })} decoding="async" />
      </a>
      <span className="blog-tags">
        <span className="blog-tag">{post.category}</span>
        <span className="blog-time">{post.readTime}</span>
      </span>
      <h3>
        <a href={href}>{post.title}</a>
      </h3>
      <Byline author={post.author} />
    </article>
  )
}

/** "Can’t find your answer? Schedule a call" card next to FAQs (sales contact from Site settings). */
export function SalesCard({ settings: s }: { settings: SiteSetting }) {
  if (!s.salesName) return null
  return (
    <div className="faq-cta">
      <h3>Can’t find your answer?</h3>
      <p>Schedule a call with our sales expert</p>
      <div className="book-call-row">
        <div className="book-call">
          <span className="book-call-ph">
            <img src={s.salesPhoto || ''} alt="" width={56} height={56} loading="lazy" decoding="async" />
          </span>
          <span className="book-call-txt">
            <span className="book-call-title">{s.salesName}</span>
            <span className="book-call-sub">{s.salesRole}</span>
          </span>
        </div>
        <a className="btn btn-primary book-call-btn" href="/contact" data-open-lead="" data-cta="schedule_call" data-tip="Schedule a Call" aria-label="Schedule a Call">
          <CalendarIcon /> Schedule a Call
        </a>
      </div>
    </div>
  )
}

/** "Home / … / Current" breadcrumb. `links`: the items before the current page. */
export function Breadcrumb({ links = [], current, className = 'breadcrumb' }: { links?: { label: string; href: string }[]; current: string; className?: string }) {
  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol>
        <li>
          <a href="/">Home</a>
        </li>
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  )
}
