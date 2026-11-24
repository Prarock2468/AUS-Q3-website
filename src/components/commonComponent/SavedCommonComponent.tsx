import { PageSection } from '@/components/sections/PageSections'
import type { Block, BlockOf } from '@/components/sections/types'
import { loadCommonComponent } from '@/lib/commonComponents'
import type { SiteSetting } from '@/payload-types'
import { Faq, withPageFaq, type FaqData } from './Faq'

/**
 * A "Common component (saved)" section: every section of the picked Common Component entry, with this page's
 * overrides ("FAQs / FAQ style for this page" on an FAQ). The section's anchor id goes on the first section.
 */
export async function SavedCommonComponent({
  block,
  settings,
  template,
}: {
  block: BlockOf<'commonComponentRef'>
  settings: SiteSetting
  template?: string | null
}) {
  const entry = await loadCommonComponent(block.component)
  return (entry?.layout || []).map((saved, i) => {
    const anchorId = i === 0 ? block.anchorId : null
    if (saved.blockType === 'faq') {
      return <Faq key={saved.id || i} block={withPageFaq(saved as FaqData, block)} settings={settings} anchorId={anchorId} />
    }
    return <PageSection key={saved.id || i} block={saved as Block} settings={settings} template={template} anchorId={anchorId} />
  })
}
