import { INSIGHT_INDUSTRIES, INSIGHT_SERVICES } from '@/collections/Insights'
import { getCaseStudies, getInsights } from '@/lib/data'
import { author } from '@/lib/media'
import { BlogCard, CaseStudyTile } from '../ui/cards'
import { ArrowIcon, NextIcon, PrevIcon } from '../ui/icons'
import { ScriptOwned } from '../ui/ScriptOwned'
import type { SectionProps } from './types'

const labelOf = (options: { label: string; value: string }[], v: string) => options.find((o) => o.value === v)?.label || v

/** "All case studies" grid on the Case studies page (filtered by the page's filter buttons). */
export async function CaseStudyList({ block }: SectionProps<'caseStudyList'>) {
  const all = await getCaseStudies()
  return (
    <section className="list-sec">
      <div className="wrap">
        <h2 className="visually-hidden">{block.heading || 'All case studies'}</h2>
        <div className="cs-grid">
          {all.map((cs, i) => (
            <CaseStudyTile key={cs.id} cs={cs} priority={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * "All insights" grid on the Insights page. Each card carries what the filters and search look at (data-tags,
 * data-svc, data-ind, data-q). Script-owned content: main.min.js adds the pager after the grid on load.
 */
export async function InsightList({ block }: SectionProps<'insightList'>) {
  const all = await getInsights()
  return (
    <section className="list-sec">
      <ScriptOwned className="wrap">
        <h2 className="visually-hidden">All insights</h2>
        <div className="blog-grid" data-page-size={block.pageSize || 12}>
          {all.map((p, i) => {
            const industries = (p.industries || []) as string[]
            const services = (p.serviceAreas || []) as string[]
            const search = [
              p.title,
              p.category,
              author(p.author)?.name,
              ...industries.map((v) => labelOf(INSIGHT_INDUSTRIES, v)),
              ...services.map((v) => labelOf(INSIGHT_SERVICES, v)),
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
            const filter = {
              ...(p.topic ? { 'data-tags': p.topic } : {}),
              'data-svc': services.join(' '),
              'data-ind': industries.join(' '),
              'data-q': search,
            }
            return <BlogCard key={p.id} post={p} filter={filter} priority={i === 0} />
          })}
        </div>
      </ScriptOwned>
    </section>
  )
}

/** "Latest insights" row with arrows (the picked posts in order, or the newest ones). */
export async function LatestInsights({ block }: SectionProps<'latestInsights'>) {
  const published = await getInsights()
  const picked = (block.posts || [])
    .map((p) => published.find((x) => x.id === (typeof p === 'object' ? p.id : p)))
    .filter((p): p is (typeof published)[number] => Boolean(p))
  const posts = picked.length ? picked : published.slice(0, block.limit || 5)
  return (
    <section className="section alt insights-sec">
      <div className="wrap" suppressHydrationWarning>
        <div className="section-head">
          <div>
            <h2>{block.heading || 'Insights'}</h2>
          </div>
          <div className="blog-nav">
            <a className="btn btn-outline" href="/insights">
              View all <ArrowIcon />
            </a>
            <div className="tq-arrows">
              {/* The row script disables the arrow at either end. */}
              <button type="button" className="blog-arrow" data-blog-prev="" aria-label="Previous posts" suppressHydrationWarning>
                <PrevIcon />
              </button>
              <button type="button" className="blog-arrow" data-blog-next="" aria-label="Next posts" suppressHydrationWarning>
                <NextIcon />
              </button>
            </div>
          </div>
        </div>
        <div className="blog-row" data-blog-row="" suppressHydrationWarning>
          {posts.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
