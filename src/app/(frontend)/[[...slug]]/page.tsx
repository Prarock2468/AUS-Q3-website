import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { HtmlElements, LivePreviewListener, SiteHeader, SkipLink } from '@/components/sharedComponent'
import { TemplateHome } from '@/components/template-home'
import { getAllPages, getCaseStudies, getInsights, getSettings, isDraft, resolvePath, toPath } from '@/lib/data'
import { renderBody } from '@/lib/render/body'
import { buildJsonLd, buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug?: string[] }> }

/** Pre-build every published page, case study and insight. Publishing in the CMS refreshes them. */
export async function generateStaticParams() {
  const [pages, caseStudies, insights] = await Promise.all([getAllPages(), getCaseStudies(), getInsights()])
  const split = (p: string) => p.split('/').filter(Boolean)
  return [
    ...pages.map((p) => ({ slug: split(p.path) })),
    ...caseStudies.map((c) => ({ slug: ['case-studies', c.slug] })),
    ...insights.map((i) => ({ slug: ['insights', i.slug] })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [r, settings] = await Promise.all([resolvePath(toPath(slug)), getSettings()])
  return buildMetadata(r, settings)
}

export default async function SitePage({ params }: Props) {
  const { slug } = await params
  const path = toPath(slug)
  const r = await resolvePath(path)
  if (r.kind === 'redirect') permanentRedirect(r.to)
  if (r.kind === 'notFound') notFound()

  const [settings, pages, draft] = await Promise.all([getSettings(), getAllPages(), isDraft()])
  const titles = new Map(pages.map((p) => [p.path, p.title]))
  const jsonLd = buildJsonLd(r, settings, titles)

  return (
    <>
      {/* The page markup is server-rendered HTML that the site's original scripts enhance, so React leaves it alone. */}
      {r.kind === 'page' && r.template === 'home' ? (
        <div id="site" style={{ display: 'contents' }} suppressHydrationWarning>
          <TemplateHome page={r.doc} path={r.path} settings={settings} />
        </div>
      ) : (
        <div id="site" style={{ display: 'contents' }} suppressHydrationWarning>
          <SkipLink />
          <SiteHeader settings={settings} path={r.path} />
          <HtmlElements html={await renderBody(r, settings, { header: false })} />
        </div>
      )}
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
      ))}
      {draft ? <LivePreviewListener /> : null}
    </>
  )
}
