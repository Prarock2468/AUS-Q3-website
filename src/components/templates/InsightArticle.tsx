import { getInsights } from '@/lib/data'
import { shorten, slugify } from '@/lib/html'
import { author as authorOf, media, mediaUrl } from '@/lib/media'
import { headingsOf, richTextToHTML } from '@/lib/richtext'
import type { Insight } from '@/payload-types'
import { ContactBand } from '../sections/ContactBand'
import { HtmlElements } from '../sharedComponent/HtmlElements'
import { BlogCard, Breadcrumb, Byline } from '../ui/cards'
import { ArrowIcon, StarIcon } from '../ui/icons'
import { ScriptOwned } from '../ui/ScriptOwned'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "03 Sep 2026", in Sydney time. */
export const formatDate = (iso?: string | null) => {
  if (!iso) return ''
  const parts = new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'numeric', year: 'numeric', timeZone: 'Australia/Sydney' }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)?.value || ''
  return `${get('day')} ${MONTHS[Number(get('month')) - 1]} ${get('year')}`
}

/** Related posts: the editor's choice, otherwise posts in the same category first. */
async function relatedFor(post: Insight) {
  const all = await getInsights()
  const picked = (post.related || []).filter((r): r is Insight => typeof r === 'object' && r !== null)
  if (picked.length) return picked.map((p) => all.find((a) => a.id === p.id) || p)
  return all
    .filter((o) => o.id !== post.id)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3)
}

/** An insight article (/insights/…): contents, meta, cover, summary, body, FAQs, author box, related posts. */
export async function InsightArticle({ post }: { post: Insight }) {
  const a = authorOf(post.author)
  const cover = media(post.coverImage)
  const faqHeading = post.faqHeading || 'FAQs'
  const toc = [...headingsOf(post.body)]
  if (post.faqs?.length) toc.push({ id: slugify(faqHeading), text: faqHeading })
  const related = await relatedFor(post)

  return (
    <>
      <section className="ins-page">
        <div className="wrap">
          <Breadcrumb links={[{ label: 'Insights', href: '/insights' }]} current={shorten(post.title)} />
          <div className="ins-layout">
            <div className="ins-side">
              <nav className="ins-toc" aria-label="Table of contents">
                <p className="ins-toc-t">Table of Contents</p>
                <ol>
                  {toc.map((h) => (
                    <li key={h.id}>
                      {/* The script marks the link of the part being read. */}
                      <a href={`#${h.id}`} suppressHydrationWarning>
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
            <div className="ins-col">
              <p className="ins-meta">
                <span className="ins-tag">{post.category}</span>
                <span>
                  Published: <strong>{formatDate(post.publishedDate)}</strong>
                </span>
                {post.readTime ? <span>{post.readTime}</span> : null}
              </p>
              {/* The first section's h1: common.min.js splits it into animated lines on load. */}
              <ScriptOwned as="h1">{post.title}</ScriptOwned>
              <Byline author={a} className="ins-by" />
              {cover ? <img fetchPriority="high" className="ins-cover" src={cover.url || ''} alt={cover.alt || ''} width={876} height={614} decoding="async" /> : null}
              {post.summary ? (
                <aside className="ins-summary" aria-labelledby="ins-sum-h">
                  <p className="ins-sum-head">
                    <span className="ins-sum-ic" aria-hidden="true">
                      <StarIcon />
                    </span>
                    <span id="ins-sum-h">Quick Summary</span>
                  </p>
                  <p>{post.summary}</p>
                </aside>
              ) : null}
              <article className="ins-body">
                <HtmlElements html={richTextToHTML(post.body, { headingIds: true })} />
                {post.faqs?.length ? (
                  <>
                    <h2 id={slugify(faqHeading)}>{faqHeading}</h2>
                    <div className="faq">
                      {post.faqs.map((f, i) => (
                        <details key={f.id || i}>
                          <summary>{f.question}</summary>
                          <div dangerouslySetInnerHTML={{ __html: richTextToHTML(f.answer) }} />
                        </details>
                      ))}
                    </div>
                  </>
                ) : null}
              </article>
              {a ? (
                <div className="ins-author">
                  <img className="blog-ini" src={mediaUrl(a.photo)} alt="" width={56} height={56} loading="lazy" decoding="async" />
                  <div>
                    <p className="ins-author-n">
                      <strong>{a.name}</strong>
                      <em>{a.role}</em>
                    </p>
                    {a.bio ? <p>{a.bio}</p> : null}
                  </div>
                  {a.linkedin ? (
                    <a className="ins-author-in" href={a.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${a.name} on LinkedIn`}>
                      <img decoding="async" src="/assets/icons/ic-linkedin.svg" alt="" width={36} height={36} loading="lazy" />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      {related.length ? (
        <section className="section alt ins-more">
          <div className="wrap" suppressHydrationWarning>
            <div className="section-head">
              <h2>More Insights</h2>
              <a className="btn btn-outline" href="/insights">
                View All <ArrowIcon />
              </a>
            </div>
            <div className="blog-grid">
              {related.map((r) => (
                <BlogCard key={r.id} post={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <ContactBand heading="Let’s Solve Your Next Technology Challenge" text="Talk to our expert and get clarity on your roadmap—no pressure, no obligations." />
    </>
  )
}
