import { HomeSection } from '@/components/homeComponent'
import { SiteExtras, SiteFooter, SiteHeader, SkipLink } from '@/components/sharedComponent'
import type { Page, SiteSetting } from '@/payload-types'
import { TEMPLATES } from '@/templates'

type Props = { page: Page; path: string; settings: SiteSetting }

/**
 * Home page template. Renders the page chrome and one component per CMS section, in the order set in the CMS.
 * Stylesheets and scripts for this template are chosen by the layout from TEMPLATES.home (src/templates.ts).
 */
export function TemplateHome({ page, path, settings }: Props) {
  const template = TEMPLATES.home
  return (
    <>
      <SkipLink />
      <SiteHeader settings={settings} path={path} />
      <main id="main" className={page.mainClass || undefined}>
        {(page.layout || []).map((block, i) => (
          <HomeSection key={block.id || i} block={block} settings={settings} />
        ))}
        {template.footerInMain ? <SiteFooter settings={settings} /> : null}
      </main>
      {template.footerInMain ? null : <SiteFooter settings={settings} />}
      <SiteExtras settings={settings} kind={template.extras} />
    </>
  )
}
