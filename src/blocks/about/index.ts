/**
 * About page only sections. Offered in the page builder only when the page's Template is About (see
 * pageBlocksFilter in ../index.ts); their styles and script come with that template.
 */
import type { Block } from 'payload'
import { AboutStoryBlock } from './AboutStory'

export { AboutStoryBlock }

/** Sections offered only on pages whose Template is About. Add new About-only blocks here. */
export const ABOUT_ONLY_BLOCKS: Block[] = [AboutStoryBlock]
