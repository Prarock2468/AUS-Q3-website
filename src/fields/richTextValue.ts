/**
 * Plain text → rich text value (Lexical JSON) for the inline text fields (src/fields/inlineText.ts): one paragraph
 * per line, empty lines dropped. Used for default values and by the seed scripts. The migration
 * 20261124_inline_rich_text converts the existing database values the same way.
 */
export function textToRichText(text: string | null | undefined) {
  const lines = (text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (!lines.length) return null
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: lines.map((line) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', text: line, format: 0, style: '', mode: 'normal' as const, detail: 0, version: 1 }],
      })),
    },
  }
}
