import { convertLexicalToHTML, defaultHTMLConverters, type HTMLConverters } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { slugify } from './html'

type Options = {
  /** Class added to bullet lists, for example "csd-list" on case studies. */
  listClass?: string
  /** Give every H2 an id (for the table of contents). */
  headingIds?: boolean
}

const textOf = (node: any): string =>
  node?.text ?? (Array.isArray(node?.children) ? node.children.map(textOf).join('') : '')

/** Render Lexical rich text to the plain, class-light HTML the site's CSS expects. */
export function richTextToHTML(data: unknown, options: Options = {}): string {
  if (!data || typeof data !== 'object' || !(data as any).root) return ''

  const converters: HTMLConverters = {
    ...defaultHTMLConverters,
    heading: ({ node, nodesToHTML }) => {
      const tag = ['h2', 'h3', 'h4'].includes(node.tag) ? node.tag : 'h2'
      const id = options.headingIds && tag === 'h2' ? ` id="${slugify(textOf(node))}"` : ''
      return `<${tag}${id}>${nodesToHTML({ nodes: node.children }).join('')}</${tag}>`
    },
    list: ({ node, nodesToHTML }) => {
      const tag = node.tag === 'ol' ? 'ol' : 'ul'
      const cls = tag === 'ul' && options.listClass ? ` class="${options.listClass}"` : ''
      return `<${tag}${cls}>${nodesToHTML({ nodes: node.children }).join('')}</${tag}>`
    },
    listitem: ({ node, nodesToHTML }) => `<li>${nodesToHTML({ nodes: node.children }).join('')}</li>`,
    paragraph: ({ node, nodesToHTML }) => {
      const inner = nodesToHTML({ nodes: node.children }).join('')
      return inner ? `<p>${inner}</p>` : ''
    },
    table: ({ node, nodesToHTML }) =>
      `<div class="ins-table" role="region" aria-label="Comparison table" tabindex="0"><table><tbody>${nodesToHTML({ nodes: node.children }).join('')}</tbody></table></div>`,
    tablerow: ({ node, nodesToHTML }) => `<tr>${nodesToHTML({ nodes: node.children }).join('')}</tr>`,
    tablecell: ({ node, nodesToHTML }) => {
      const tag = (node as any).headerState > 0 ? 'th' : 'td'
      // Cells hold paragraphs in Lexical; the original tables had bare text.
      const inner = nodesToHTML({ nodes: node.children }).join('').replace(/^<p>([\s\S]*)<\/p>$/, '$1')
      return `<${tag}>${inner}</${tag}>`
    },
  }

  return convertLexicalToHTML({
    data: data as SerializedEditorState,
    converters,
    disableContainer: true,
    disableIndent: true,
    disableTextAlign: true,
  })
}

/** Plain text of a rich text value (for JSON-LD answers and search). */
export function richTextToText(data: unknown): string {
  const root = (data as any)?.root
  if (!root) return ''
  const walk = (n: any): string =>
    n.type === 'text' ? n.text : Array.isArray(n.children) ? n.children.map(walk).join(n.type === 'root' ? ' ' : '') + (['paragraph', 'listitem', 'heading'].includes(n.type) ? ' ' : '') : ''
  return walk(root).replace(/\s+/g, ' ').trim()
}

/** H2 headings of an article, for the table of contents. */
export function headingsOf(data: unknown): { id: string; text: string }[] {
  const root = (data as any)?.root
  if (!root) return []
  return (root.children || [])
    .filter((n: any) => n.type === 'heading' && n.tag === 'h2')
    .map((n: any) => ({ id: slugify(textOf(n)), text: textOf(n).trim() }))
}
