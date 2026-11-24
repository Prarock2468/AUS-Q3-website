/**
 * Page banner sections shared by several templates. "Hero banner" is offered in the page builder only when the
 * page's Template is Services overview, Industry detail or Service page (see pageBlocksFilter in ../index.ts), and is
 * drawn in that template's design.
 */
import type { Block } from 'payload'
import { DetailHeroBlock } from './DetailHero'

export { DetailHeroBlock }

/** Sections offered only on the Services overview, Industry detail and Service pages. Add new ones here. */
export const DETAIL_ONLY_BLOCKS: Block[] = [DetailHeroBlock]
