import type { ReactNode } from 'react'
import { SiteExtras, SiteFooter, SiteHeader, SkipLink } from '@/components/sharedComponent'
import type { SiteSetting } from '@/payload-types'
import { TEMPLATES, type TemplateName } from '@/templates'

type Props = { settings: SiteSetting; path: string; template: TemplateName; mainClass?: string | null; children: ReactNode }

/**
 * The page frame every template shares: skip link, header, <main> with the page content, footer (inside <main> on
 * Service pages) and what follows the footer (lead dialog and cookie banner, or the agent button).
 * Stylesheets and scripts for the template are chosen by the layout from TEMPLATES (src/templates.ts).
 */
export function TemplateChrome({ settings, path, template, mainClass, children }: Props) {
  const t = TEMPLATES[template]
  return (
    <>
      <SkipLink />
      <SiteHeader settings={settings} path={path} />
      <main id="main" className={mainClass || undefined}>
        {children}
        {t.footerInMain ? <SiteFooter settings={settings} /> : null}
      </main>
      {t.footerInMain ? null : <SiteFooter settings={settings} />}
      <SiteExtras settings={settings} kind={t.extras} />
    </>
  )
}
