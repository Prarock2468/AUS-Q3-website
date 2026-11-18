/**
 * Page builder blocks. Each block renders one <section> of the page, using the same markup and CSS classes as the
 * original HTML site, so the design is unchanged.
 *
 * One file per block, grouped like src/components:
 *   page/    the original page builder sections (HTML, FAQ, contact band, shared section, grids, insights slider)
 *   common/  structured reusable sections + CommonComponentRef (saved Common Component entries)
 *   home/    home page only sections
 *   shared.ts  options used by more than one block
 *
 * To add a block: create its file in the right folder, add it to that folder's index.ts list, then run
 * `npm run generate:types` and `npm run migrate:create -- <name>`.
 */
import type { Block } from 'payload'
import { CommonComponentRef, commonComponentBlocks } from './common'
import { HOME_ONLY_BLOCKS } from './home'
import { baseBlocks } from './page'

export * from './common'
export * from './home'
export * from './page'
export { FAQ_STYLES } from './shared'

/**
 * Sections offered in the page builder, in any order. The common components either hold content for this page only
 * or point at a saved Common Component entry. Home-only sections are filtered by pageBlocksFilter.
 */
export const pageBlocks: Block[] = [...baseBlocks, ...commonComponentBlocks, CommonComponentRef, ...HOME_ONLY_BLOCKS]

/**
 * Which sections a page may use: the home-only ones only when the page's Template is Home. Payload applies this in
 * the "Add section" menu and again when saving, so a home-only section can't be saved on another page.
 */
export const pageBlocksFilter = ({ data }: { data?: { template?: string | null } }): string[] | true =>
  data?.template === 'home' ? true : pageBlocks.filter((b) => !HOME_ONLY_BLOCKS.includes(b)).map((b) => b.slug)
