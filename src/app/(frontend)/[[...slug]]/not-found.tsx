import { NotFoundContent, TemplateChrome } from '@/components/templates'
import { getSettings } from '@/lib/data'

export default async function NotFound() {
  const settings = await getSettings()
  return (
    <div id="site" style={{ display: 'contents' }} suppressHydrationWarning>
      <TemplateChrome settings={settings} path="/404" template="notFound">
        <NotFoundContent />
      </TemplateChrome>
    </div>
  )
}
