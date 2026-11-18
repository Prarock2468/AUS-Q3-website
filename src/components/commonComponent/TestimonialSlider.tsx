import { HtmlElements } from '@/components/sharedComponent'
import { renderTestimonialSlider } from '@/lib/render/common'
import type { TestimonialSliderBlock } from '@/payload-types'

/**
 * Testimonials carousel (section.testi), showing the slider's testimonials.
 * Markup lives in src/lib/render/common.ts.
 */
export async function TestimonialSlider({ block }: { block: TestimonialSliderBlock }) {
  return <HtmlElements html={await renderTestimonialSlider(block)} />
}
