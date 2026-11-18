import { HtmlElements, SiteHeader, SkipLink } from '@/components/sharedComponent'
import { getSettings } from '@/lib/data'
import { NOT_FOUND_MAIN, wrapChrome } from '@/lib/render/body'

export default async function NotFound() {
  const settings = await getSettings()
  const html = wrapChrome({ settings, path: '/404', template: 'notFound', main: NOT_FOUND_MAIN, header: false })
  return (
    <div id="site" style={{ display: 'contents' }} suppressHydrationWarning>
      <SkipLink />
      <SiteHeader settings={settings} path="/404" />
      <HtmlElements html={html} />
    </div>
  )
}
