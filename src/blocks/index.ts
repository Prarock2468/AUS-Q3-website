/**
 * Page builder blocks. Each block renders one <section> of the page, using the same markup and CSS classes as the
 * original HTML site, so the design is unchanged.
 *
 * One file per block, grouped like src/components:
 *   page/      the original page builder sections (HTML, FAQ, contact band, shared section, grids, insights slider…)
 *   common/    structured reusable sections + CommonComponentRef (saved Common Component entries)
 *   home/      home page only sections
 *   services/  Services page (/services) only sections
 *   servicePage/  Service page (/services/…) only sections (services offered, delivery process)
 *   about/     About page only sections
 *   detail/    "Hero banner" for the Services, Industry detail and Service pages (drawn in each template's design)
 *   shared.ts  options used by more than one block
 *
 * To add a block: create its file in the right folder, add it to that folder's index.ts list, then run
 * `npm run generate:types` and `npm run migrate:create -- <name>`.
 */
import type { Block } from 'payload'
import { ABOUT_ONLY_BLOCKS } from './about'
import { CommonComponentRef, commonComponentBlocks } from './common'
import { DETAIL_ONLY_BLOCKS } from './detail'
import { HomeAboutBlock, HOME_ONLY_BLOCKS } from './home'
import { baseBlocks } from './page'
import { SERVICES_ONLY_BLOCKS } from './services'
import { SERVICE_PAGE_BLOCKS } from './servicePage'

export * from './about'
export * from './common'
export * from './detail'
export * from './home'
export * from './page'
export * from './services'
export * from './servicePage'
export { FAQ_STYLES } from './shared'

/**
 * Sections that only work with certain page Templates (their styles and scripts come with them, e.g. About → about/). A section may be
 * listed for several templates: "About us (statement)" is drawn in the Home design on Home and in the About design
 * on About; "Hero banner" is drawn in the Services overview, Industry detail or Service page design.
 */
const TEMPLATE_ONLY_BLOCKS: Record<string, Block[]> = {
  home: HOME_ONLY_BLOCKS,
  services: [...SERVICES_ONLY_BLOCKS, ...DETAIL_ONLY_BLOCKS],
  about: [HomeAboutBlock, ...ABOUT_ONLY_BLOCKS],
  service: [...DETAIL_ONLY_BLOCKS, ...SERVICE_PAGE_BLOCKS],
  industryDetail: DETAIL_ONLY_BLOCKS,
}
const templateOnly = [...new Set(Object.values(TEMPLATE_ONLY_BLOCKS).flat())]

/**
 * Sections offered in the page builder, in any order. The common components either hold content for this page only
 * or point at a saved Common Component entry. Template-only sections are filtered by pageBlocksFilter.
 */
export const pageBlocks: Block[] = [...baseBlocks, ...commonComponentBlocks, CommonComponentRef, ...templateOnly]

/**
 * Which sections a page may use: every general section, plus the ones made for the page's Template (Home sections
 * on Home, Services sections on Services). Payload applies this in the "Add section" menu and again when saving, so
 * a template-only section can't be saved on another page.
 */
export const pageBlocksFilter = ({ data }: { data?: { template?: string | null } }): string[] =>
  pageBlocks
    .filter((b) => !templateOnly.includes(b) || (TEMPLATE_ONLY_BLOCKS[data?.template || ''] || []).includes(b))
    .map((b) => b.slug)
