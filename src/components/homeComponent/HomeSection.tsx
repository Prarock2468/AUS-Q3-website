import { CaseStudiesSlider, Faq, SavedCommonComponent } from '@/components/commonComponent'
import type { Block } from '@/lib/render/blocks'
import type { SiteSetting } from '@/payload-types'
import { HomeAbout } from './HomeAbout'
import { HomeHero } from './HomeHero'
import { HomeIndustries } from './HomeIndustries'
import { HomeServices } from './HomeServices'
import { HtmlSection } from './HtmlSection'
import { RenderedSection } from './RenderedSection'

/**
 * Picks the component for one CMS section on the home page. The order and set of sections come from the CMS
 * (Pages → Home), so editors can reorder, add or remove them.
 */
export function HomeSection({ block, settings }: { block: Block; settings: SiteSetting }) {
  switch (block.blockType) {
    case 'htmlSection':
      return <HtmlSection block={block} settings={settings} />
    case 'homeHero':
      return <HomeHero block={block} settings={settings} />
    case 'homeAbout':
      return <HomeAbout block={block} settings={settings} />
    case 'homeServices':
      return <HomeServices block={block} settings={settings} />
    case 'homeIndustries':
      return <HomeIndustries block={block} settings={settings} />
    case 'caseStudiesSlider':
      return <CaseStudiesSlider block={block} />
    case 'commonComponentRef':
      // Saved Common Component entries (Client logos, FAQ…).
      return <SavedCommonComponent block={block} settings={settings} />
    case 'faq':
      return <Faq block={block} settings={settings} />
    default:
      return <RenderedSection block={block} settings={settings} />
  }
}
