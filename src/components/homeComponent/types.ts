import type { Block } from '@/lib/render/blocks'
import type { SiteSetting } from '@/payload-types'

/** One CMS block of the given type, for example BlockOf<'faq'>. */
export type BlockOf<T extends Block['blockType']> = Extract<Block, { blockType: T }>

/** Props every home section receives: its CMS block and the global Site settings. */
export type SectionProps<T extends Block['blockType']> = { block: BlockOf<T>; settings: SiteSetting }
