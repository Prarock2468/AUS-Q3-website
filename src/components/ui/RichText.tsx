import { Fragment, type ReactNode } from 'react'
import { isExternal } from './icons'

/**
 * Inline rich text (src/fields/inlineText.ts): bold, italic, underline, links. It is drawn inside the design's own
 * element (usually a <p>), so each line (paragraph in the editor) is separated by a <br> rather than wrapped in a <p>.
 * Plain strings are drawn as they are (for text written in code).
 */
export function RichText({ value }: { value: unknown }) {
  if (typeof value === 'string') return value
  const lines = paragraphsOf(value)
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i ? <br /> : null}
      <Nodes nodes={line.children} />
    </Fragment>
  ))
}

/** True when a rich text (or plain) value has any text, for optional parts such as an intro. */
export function hasText(value: unknown): boolean {
  if (typeof value === 'string') return Boolean(value.trim())
  return paragraphsOf(value).length > 0
}

/* --- Lexical JSON ------------------------------------------------------------------------------------------------ */

type LexicalNode = {
  type: string
  text?: string
  format?: number | string
  children?: LexicalNode[]
  fields?: { url?: string; newTab?: boolean; linkType?: 'custom' | 'internal'; doc?: { relationTo?: string; value?: unknown } }
}

const textOf = (n: LexicalNode): string => n.text ?? (n.children || []).map(textOf).join('')

/** The non-empty paragraphs of a value (each one is a line on the website). */
function paragraphsOf(value: unknown): LexicalNode[] {
  const root = (value as { root?: LexicalNode } | null)?.root
  return (root?.children || []).filter((p) => textOf(p).trim() || (p.children || []).some((c) => c.type === 'linebreak'))
}

/** Lexical's text format bits, outermost first. */
const FORMATS: [number, 'strong' | 'em' | 'u' | 's' | 'code' | 'sub' | 'sup'][] = [
  [1, 'strong'],
  [2, 'em'],
  [8, 'u'],
  [4, 's'],
  [16, 'code'],
  [32, 'sub'],
  [64, 'sup'],
]

/** Where a link to a page, case study or insight goes. */
function hrefOf(fields: LexicalNode['fields']): string | null {
  if (!fields) return null
  if (fields.linkType !== 'internal') return fields.url || null
  const doc = fields.doc?.value as { path?: string; slug?: string } | undefined
  if (!doc || typeof doc !== 'object') return null
  if (fields.doc?.relationTo === 'pages') return doc.path || null
  if (fields.doc?.relationTo === 'case-studies') return doc.slug ? `/case-studies/${doc.slug}` : null
  if (fields.doc?.relationTo === 'insights') return doc.slug ? `/insights/${doc.slug}` : null
  return null
}

function Nodes({ nodes }: { nodes?: LexicalNode[] }) {
  return (nodes || []).map((n, i) => <Node key={i} node={n} />)
}

function Node({ node }: { node: LexicalNode }): ReactNode {
  switch (node.type) {
    case 'text': {
      const format = typeof node.format === 'number' ? node.format : 0
      return FORMATS.reduceRight<ReactNode>((inner, [bit, Tag]) => (format & bit ? <Tag>{inner}</Tag> : inner), node.text)
    }
    case 'linebreak':
      return <br />
    case 'tab':
      return ' '
    case 'link':
    case 'autolink': {
      const href = hrefOf(node.fields)
      if (!href) return <Nodes nodes={node.children} />
      const newTab = Boolean(node.fields?.newTab)
      return (
        <a href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : isExternal(href) ? 'noopener' : undefined}>
          <Nodes nodes={node.children} />
        </a>
      )
    }
    default:
      return <Nodes nodes={node.children} />
  }
}
