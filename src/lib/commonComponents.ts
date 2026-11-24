/**
 * Data for the common components (Common Component entries, the testimonials list, the case studies a slider shows).
 * Their markup is in src/components/commonComponent.
 */
import { cache } from 'react'
import { TESTIMONIALS_ENTRY_KEY } from '@/blocks/common/Testimonials'
import type { CaseStudiesSliderBlock, CommonComponent, TestimonialSliderBlock } from '@/payload-types'
import { getCaseStudies, getPayloadClient } from './data'

/** Loads a saved Common Component entry (by id or populated doc) with its images, ready to render. */
export async function loadCommonComponent(ref: number | CommonComponent | null | undefined): Promise<CommonComponent | null> {
  const id = typeof ref === 'object' ? ref?.id : ref
  if (!id) return null
  const payload = await getPayloadClient()
  try {
    return await payload.findByID({ collection: 'commonComponent', id, depth: 2 })
  } catch {
    return null
  }
}

/** The Testimonial slider in Common Component → Testimonial Slider: the list every Testimonials section picks from. */
export const getTestimonialsSlider = cache(async (): Promise<TestimonialSliderBlock | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'commonComponent',
    where: { key: { equals: TESTIMONIALS_ENTRY_KEY } },
    depth: 2,
    limit: 1,
  })
  return (docs[0]?.layout?.find((s) => s.blockType === 'testimonialSlider') as TestimonialSliderBlock | undefined) || null
})

/**
 * The case studies a Case studies slider shows. Only published ones: in the order picked in the CMS, or, when none
 * are picked, the first `limit` in list order.
 */
export async function caseStudiesForSlider(block: Pick<CaseStudiesSliderBlock, 'caseStudies' | 'limit'>) {
  const published = await getCaseStudies()
  const picked = (block.caseStudies || [])
    .map((c) => published.find((p) => p.id === (typeof c === 'object' ? c?.id : c)))
    .filter((c): c is (typeof published)[number] => Boolean(c))
  return picked.length ? picked : published.slice(0, block.limit || 6)
}
