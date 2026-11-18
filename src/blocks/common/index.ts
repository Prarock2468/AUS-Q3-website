/**
 * Common components: structured, reusable sections. They can hold content for one page (page builder) or be saved
 * once in the "Common Component" collection and placed on many pages with CommonComponentRef.
 */
import type { Block } from 'payload'
import { CaseStudiesSliderBlock } from './CaseStudiesSlider'
import { ClientLogosBlock } from './ClientLogos'
import { CommonComponentRef } from './CommonComponentRef'
import { TestimonialSliderBlock } from './TestimonialSlider'
import { TestimonialsBlock } from './Testimonials'

export { CaseStudiesSliderBlock, ClientLogosBlock, CommonComponentRef, TestimonialSliderBlock, TestimonialsBlock }
export { TESTIMONIALS_ENTRY_KEY } from './Testimonials'

/**
 * Structured sections offered in the page builder. "Testimonials" picks from the list kept in Common Component →
 * Testimonial Slider (testimonials are not typed into pages).
 */
export const commonComponentBlocks: Block[] = [ClientLogosBlock, TestimonialsBlock, CaseStudiesSliderBlock]

/**
 * Structured sections offered inside a Common Component entry. No case studies slider here: pages add the page
 * builder "Case studies slider" section instead, which picks from the Case studies collection.
 */
export const commonComponentEntryBlocks: Block[] = [ClientLogosBlock, TestimonialSliderBlock]
