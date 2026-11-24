/**
 * Services page only sections. Offered in the page builder only when the page's Template is Services (see
 * pageBlocksFilter in ../index.ts); their styles and script come with that template.
 */
import type { Block } from 'payload'
import { ServicesListBlock } from './ServicesList'

export { ServicesListBlock }

/** Sections offered only on pages whose Template is Services. Add new Services-only blocks here. */
export const SERVICES_ONLY_BLOCKS: Block[] = [ServicesListBlock]
