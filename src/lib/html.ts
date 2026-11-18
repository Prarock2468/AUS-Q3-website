/** Tiny helpers for building HTML strings safely. */

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export const esc = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c])

/** Optional attribute: ` name="value"` or nothing. */
export const attr = (name: string, value: unknown): string =>
  value === undefined || value === null || value === '' || value === false ? '' : ` ${name}="${esc(value)}"`

/** The arrow icon used on buttons across the site. */
export const ARROW_ICON =
  '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'

export const slugify = (text: string, max = 60) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)

/** Shorten a label for breadcrumbs the way the original site did: whole words up to 44 characters, then "…". */
export const shorten = (text: string, max = 44) => {
  const t = text.trim()
  if (t.length <= max + 1) return t
  let out = ''
  for (const word of t.split(/\s+/)) {
    if ((out ? out.length + 1 : 0) + word.length > max) break
    out = out ? `${out} ${word}` : word
  }
  return `${out}…`
}

export const stripTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
