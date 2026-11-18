import { HtmlElements } from '@/components/sharedComponent'
import { renderBlock, type Block } from '@/lib/render/blocks'
import type { SiteSetting } from '@/payload-types'

/**
 * Any section without its own React component, drawn by the shared HTML renderer (src/lib/render) used by every
 * other page. On the home page: Testimonials (shared section), Latest insights and the Contact form band. Editors
 * can also add any other section type here.
 */
export async function RenderedSection({ block, settings }: { block: Block; settings: SiteSetting }) {
  return <HtmlElements html={await renderBlock(block, settings)} />
}
