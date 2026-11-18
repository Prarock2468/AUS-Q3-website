import type { SiteSetting } from '@/payload-types'
import { TEMPLATES, type TemplateName } from '@/templates'
import type { Resolved } from '../data'
import { attr } from '../html'
import { renderBlocks } from './blocks'
import { renderCaseStudy } from './caseStudy'
import { renderExtras, renderFooter, renderHeader } from './chrome'
import { renderInsight } from './insight'

/** Wrap main content in the site chrome: skip link, header, <main>, footer and floating extras. */
export function wrapChrome(opts: {
  settings: SiteSetting
  path: string
  template: TemplateName
  main: string
  mainClass?: string | null
  /** false when the skip link and header are rendered as React components (SkipLink, SiteHeader). */
  header?: boolean
}) {
  const t = TEMPLATES[opts.template]
  const footer = renderFooter(opts.settings)
  const header = opts.header !== false
  return [
    header ? '<a class="skip" href="#main">Skip to content</a>' : '',
    header ? renderHeader(opts.settings, opts.path) : '',
    `<main id="main"${attr('class', opts.mainClass)}>`,
    opts.main,
    t.footerInMain ? footer : '',
    '</main>',
    t.footerInMain ? '' : footer,
    renderExtras(opts.settings, t.extras),
  ]
    .filter(Boolean)
    .join('\n')
}

/** Page HTML in the site chrome. Pass { header: false } when the page renders SkipLink and SiteHeader itself. */
export async function renderBody(r: Resolved, settings: SiteSetting, opts: { header?: boolean } = {}): Promise<string> {
  if (r.kind === 'caseStudy') {
    return wrapChrome({ settings, path: r.path, template: r.template, main: await renderCaseStudy(r.doc), ...opts })
  }
  if (r.kind === 'insight') {
    return wrapChrome({ settings, path: r.path, template: r.template, main: await renderInsight(r.doc), ...opts })
  }
  if (r.kind === 'page') {
    return wrapChrome({
      settings,
      path: r.path,
      template: r.template,
      main: await renderBlocks(r.doc.layout, settings),
      mainClass: r.doc.mainClass,
      ...opts,
    })
  }
  return ''
}

export const NOT_FOUND_MAIN = `<section class="list-hero"><div class="wrap">
<h1>Page not found</h1>
<p class="list-lede">The page you are looking for has moved or does not exist.</p>
<p style="margin-top:24px"><a class="btn btn-primary" href="/">Back to home</a> <a class="btn btn-outline" href="/search">Search the site</a></p>
</div></section>`
