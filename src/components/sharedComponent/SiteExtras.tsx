import { renderExtras } from '@/lib/chrome'
import type { SiteSetting } from '@/payload-types'
import type { Template } from '@/templates'
import { HtmlElements } from './HtmlElements'

/** What follows the footer: the lead dialog and cookie banner ("full"), or only the agent button ("simple"). */
export function SiteExtras({ settings, kind }: { settings: SiteSetting; kind: Template['extras'] }) {
  return <HtmlElements html={renderExtras(settings, kind)} />
}
