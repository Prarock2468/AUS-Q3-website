import type { Page, SiteSetting } from '@/payload-types'

/** One section of a page's layout (Pages → Page sections). */
export type Block = NonNullable<Page['layout']>[number]

/** One section type, for example BlockOf<'faq'>. */
export type BlockOf<T extends Block['blockType']> = Extract<Block, { blockType: T }>

/**
 * Props every section component receives: its CMS block, the Site settings, and the page's Template (some sections
 * are drawn in the design of the template they sit on).
 */
export type SectionProps<T extends Block['blockType']> = { block: BlockOf<T>; settings: SiteSetting; template?: string | null }
