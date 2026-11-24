import { HtmlElements } from '../sharedComponent/HtmlElements'
import type { SectionProps } from './types'

/** Adds an id to the opening <section> tag of CMS HTML, for in-page links. */
export const withAnchor = (html: string, anchorId?: string | null) =>
  anchorId ? html.replace(/^(\s*<section\b)(?![^>]*\bid=)/, `$1 id="${anchorId.replace(/"/g, '&quot;')}"`) : html

/**
 * A "Custom section (HTML)": HTML typed in the CMS, output as typed. Keep its class names when editing: the
 * stylesheet and scripts depend on them.
 */
export function HtmlSection({ block }: SectionProps<'htmlSection'>) {
  return <HtmlElements html={block.html} />
}

/** A "Shared section": HTML saved once in Site settings (for example the Testimonials markup) and reused on pages. */
export function SharedSection({ block, settings }: SectionProps<'sharedSection'>) {
  const html = (settings as unknown as Record<string, string | null | undefined>)[block.section] || ''
  return <HtmlElements html={withAnchor(html, block.anchorId)} />
}
