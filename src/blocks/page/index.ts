import type { Block } from 'payload'
import { CaseStudyList } from './CaseStudyList'
import { ContactBand } from './ContactBand'
import { FaqBlock } from './Faq'
import { HtmlSection } from './HtmlSection'
import { InsightList } from './InsightList'
import { LatestInsights } from './LatestInsights'
import { SharedSection } from './SharedSection'

export { CaseStudyList, ContactBand, FaqBlock, HtmlSection, InsightList, LatestInsights, SharedSection }
export { SHARED_SECTIONS } from './SharedSection'

/** The original page builder sections (also offered inside Common Component entries). */
export const baseBlocks: Block[] = [
  HtmlSection,
  FaqBlock,
  ContactBand,
  SharedSection,
  CaseStudyList,
  InsightList,
  LatestInsights,
]
