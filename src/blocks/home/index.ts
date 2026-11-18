/**
 * Home page only sections. Offered in the page builder only when the page's Template is Home (see pageBlocksFilter
 * in ../index.ts), and rendered by src/components/homeComponent.
 */
import type { Block } from 'payload'
import { HomeAboutBlock } from './HomeAbout'
import { HomeHeroBlock } from './HomeHero'
import { HomeIndustriesBlock } from './HomeIndustries'
import { HomeServicesBlock } from './HomeServices'

export { HomeAboutBlock, HomeHeroBlock, HomeIndustriesBlock, HomeServicesBlock }

/** Sections offered only on pages whose Template is Home. Add new home-only blocks here. */
export const HOME_ONLY_BLOCKS: Block[] = [HomeHeroBlock, HomeAboutBlock, HomeServicesBlock, HomeIndustriesBlock]
