import { HtmlElements } from '@/components/sharedComponent'
import type { SectionProps } from './types'

/**
 * A "Custom section (HTML)" from the CMS, output as typed. On the home page: the hero (section.home-hero), the
 * "About Q3" statement (section.statement), Industries (section.industries-section) and the hero image preload.
 * Keep their class names when editing: the stylesheet and scripts depend on them.
 */
export function HtmlSection({ block }: SectionProps<'htmlSection'>) {
  return <HtmlElements html={block.html} />
}
