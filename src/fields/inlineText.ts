import type { RichTextField } from 'payload'
import { inlineEditor } from '../lexical'

/**
 * A description or intro with bold, italic, underline and links (src/lexical.ts → inlineEditor). Drawn on the website
 * by <RichText> (src/components/ui/RichText.tsx) inside the design's paragraph; Enter starts a new line.
 */
export const inlineText = (name: string, extra: Partial<Omit<RichTextField, 'type' | 'name' | 'editor'>> = {}): RichTextField => ({
  name,
  type: 'richText',
  editor: inlineEditor,
  ...extra,
})
