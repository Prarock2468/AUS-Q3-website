import { CaseStudiesSlider, ClientLogos, Faq, SavedCommonComponent, TestimonialSlider, Testimonials } from '@/components/commonComponent'
import { HomeAbout, HomeHero, HomeIndustries, HomeServices } from '@/components/homeComponent'
import type { SiteSetting, TestimonialSliderBlock } from '@/payload-types'
import { AboutStatement, AboutStory } from './AboutSections'
import { HtmlSection, SharedSection } from './CmsHtml'
import { ContactBand } from './ContactBand'
import { ContactInfo, EnquiryForm, FormSection } from './ContactForms'
import { DetailHero } from './DetailHero'
import { CaseStudyList, InsightList, LatestInsights } from './Lists'
import { ServiceOfferings, ServiceProcess } from './ServicePageSections'
import { ServicesList } from './ServicesList'
import type { Block } from './types'

type Props = { settings: SiteSetting; template?: string | null }

/**
 * A page's sections (Pages → Page sections), in the order set in the CMS. A "Contact info" section directly
 * followed by an "Enquiry form" or "Form" section is drawn as one section, side by side (the Contact Us layout).
 */
export function PageSections({ blocks, ...props }: Props & { blocks: Block[] | null | undefined }) {
  const list = blocks || []
  return list.map((block, i) => {
    const prev = list[i - 1]
    const next = list[i + 1]
    const key = block.id || i
    if (block.blockType === 'contactInfo' && (next?.blockType === 'enquiryForm' || next?.blockType === 'formSection')) return null
    if (prev?.blockType === 'contactInfo' && block.blockType === 'enquiryForm') return <EnquiryForm key={key} block={block} info={prev} />
    if (prev?.blockType === 'contactInfo' && block.blockType === 'formSection') return <FormSection key={key} block={block} info={prev} />
    return <PageSection key={key} block={block} {...props} />
  })
}

/**
 * One section: picks its component by section type. Also used for the sections inside a saved Common Component
 * entry (which can be a Testimonial slider); `anchorId` then puts the reference's anchor on the first one.
 */
export function PageSection({
  block,
  settings,
  template,
  anchorId,
}: Props & { block: Block | TestimonialSliderBlock; anchorId?: string | null }) {
  switch (block.blockType) {
    case 'htmlSection':
      return <HtmlSection block={block} settings={settings} />
    case 'sharedSection':
      return <SharedSection block={{ ...block, anchorId: anchorId || block.anchorId }} settings={settings} />

    // Home template sections.
    case 'homeHero':
      return <HomeHero block={block} settings={settings} />
    case 'homeServices':
      return <HomeServices block={block} settings={settings} />
    case 'homeIndustries':
      return <HomeIndustries block={block} settings={settings} />
    case 'homeAbout':
      // Same section, drawn in the Home design on Home and in the About design on About.
      return template === 'home' ? <HomeAbout block={block} settings={settings} /> : <AboutStatement block={block} settings={settings} />

    // About, Services, Service page and detail page sections.
    case 'aboutStory':
      return <AboutStory block={block} settings={settings} />
    case 'servicesList':
      return <ServicesList block={block} settings={settings} />
    case 'detailHero':
      return <DetailHero block={block} settings={settings} template={template} />
    case 'serviceOfferings':
      return <ServiceOfferings block={block} settings={settings} />
    case 'serviceProcess':
      return <ServiceProcess block={block} settings={settings} />

    // Forms.
    case 'contactBand':
      return <ContactBand {...block} anchorId={anchorId || block.anchorId} />
    case 'contactInfo':
      return <ContactInfo block={block} />
    case 'enquiryForm':
      return <EnquiryForm block={block} />
    case 'formSection':
      return <FormSection block={block} />

    // Lists.
    case 'caseStudyList':
      return <CaseStudyList block={block} settings={settings} />
    case 'insightList':
      return <InsightList block={block} settings={settings} />
    case 'latestInsights':
      return <LatestInsights block={block} settings={settings} />

    // Common components.
    case 'faq':
      return <Faq block={block} settings={settings} anchorId={anchorId} />
    case 'clientLogos':
      return <ClientLogos block={block} anchorId={anchorId} />
    case 'testimonialSlider':
      return <TestimonialSlider block={block} anchorId={anchorId} />
    case 'testimonials':
      return <Testimonials block={anchorId ? { ...block, anchorId } : block} />
    case 'caseStudiesSlider':
      return <CaseStudiesSlider block={block} anchorId={anchorId} />
    case 'commonComponentRef':
      return <SavedCommonComponent block={block} settings={settings} template={template} />

    default:
      return null
  }
}
