import type { Block } from 'payload'
import { CaseStudyList } from './CaseStudyList'
import { ContactBand } from './ContactBand'
import { ContactInfoBlock } from './ContactInfo'
import { EnquiryFormBlock } from './EnquiryForm'
import { FaqBlock } from './Faq'
import { FormSectionBlock } from './FormSection'
import { HtmlSection } from './HtmlSection'
import { InsightList } from './InsightList'
import { LatestInsights } from './LatestInsights'
import { SharedSection } from './SharedSection'

export {
  CaseStudyList,
  ContactBand,
  ContactInfoBlock,
  EnquiryFormBlock,
  FaqBlock,
  FormSectionBlock,
  HtmlSection,
  InsightList,
  LatestInsights,
  SharedSection,
}
export { SHARED_SECTIONS } from './SharedSection'

/** The original page builder sections (also offered inside Common Component entries). */
export const baseBlocks: Block[] = [
  HtmlSection,
  FaqBlock,
  ContactBand,
  ContactInfoBlock,
  FormSectionBlock,
  EnquiryFormBlock,
  SharedSection,
  CaseStudyList,
  InsightList,
  LatestInsights,
]
