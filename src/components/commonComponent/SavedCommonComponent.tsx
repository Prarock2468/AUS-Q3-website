import { HtmlElements } from '@/components/sharedComponent'
import { renderBlock, type Block } from '@/lib/render/blocks'
import { loadCommonComponent, renderCommonSection, withAnchor } from '@/lib/render/common'
import type { SiteSetting } from '@/payload-types'
import { Faq, withPageFaq, type FaqData } from './Faq'

type RefBlock = Extract<Block, { blockType: 'commonComponentRef' }>

/**
 * A "Common component (saved)" section: renders every section of the picked Common Component entry, with this
 * page's overrides. An FAQ renders with the <Faq> component ("FAQs / FAQ style for this page" applied); the other
 * sections use the shared HTML renderers. The section's anchor id goes on the first section.
 */
export async function SavedCommonComponent({ block, settings }: { block: RefBlock; settings: SiteSetting }) {
  const entry = await loadCommonComponent(block.component)
  const sections = entry?.layout || []

  const out = await Promise.all(
    sections.map(async (saved, i) => {
      const anchorId = i === 0 ? block.anchorId : null
      if (saved.blockType === 'faq') {
        return (
          <Faq key={saved.id || i} block={withPageFaq(saved as FaqData, block)} settings={settings} anchorId={anchorId} />
        )
      }
      const html = (await renderCommonSection(saved)) ?? (await renderBlock(saved as Block, settings))
      return <HtmlElements key={saved.id || i} html={withAnchor(html, anchorId)} />
    }),
  )
  return <>{out}</>
}
