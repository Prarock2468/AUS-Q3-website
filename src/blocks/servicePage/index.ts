/**
 * Service page sections (/services/…). Offered in the page builder only when the page's Template is Service page
 * (see pageBlocksFilter in ../index.ts); their styles and script (service.min.css / .js) come with that template.
 */
import type { Block } from 'payload'
import { ServiceOfferingsBlock } from './ServiceOfferings'
import { ServiceProcessBlock } from './ServiceProcess'

export { ServiceOfferingsBlock, ServiceProcessBlock }

/** Sections offered only on pages whose Template is Service page. Add new ones here. */
export const SERVICE_PAGE_BLOCKS: Block[] = [ServiceOfferingsBlock, ServiceProcessBlock]
