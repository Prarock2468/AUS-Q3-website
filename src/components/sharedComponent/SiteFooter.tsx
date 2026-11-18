import { renderFooter } from '@/lib/render/chrome'
import type { SiteSetting } from '@/payload-types'
import { HtmlElements } from './HtmlElements'

/** Site footer from Site settings. */
export function SiteFooter({ settings }: { settings: SiteSetting }) {
  return <HtmlElements html={renderFooter(settings)} />
}
