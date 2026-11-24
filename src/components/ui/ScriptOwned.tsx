import { Fragment, isValidElement, type CSSProperties, type JSX, type ReactNode } from 'react'
import { esc } from '@/lib/html'

/**
 * Markup whose content the site's original scripts rebuild on page load, for example:
 *  - common.min.js splits the first section's <h1> into animated .hl spans;
 *  - the testimonial scripts add a "View All" button inside each .tbody;
 *  - main.min.js adds the pager after the insights grid.
 * If React managed this content it would later trip over nodes it did not create (for example when Live Preview
 * refreshes the page). So the element itself is React's, but its content is written as server HTML that React
 * leaves alone (like the CMS HTML sections). Write the content as normal JSX; it is turned into HTML here.
 * (The scripts themselves run after hydration: see components/sharedComponent/SiteScripts.)
 */
export function ScriptOwned({
  as: Tag = 'div',
  children,
  ...props
}: { as?: keyof JSX.IntrinsicElements; children: ReactNode } & Record<string, unknown>) {
  return <Tag {...props} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: toHtml(children) }} />
}

/* --- JSX → HTML for ScriptOwned content (plain elements and simple components only) ----------------------------- */

const VOID = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const ATTR: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
  tabIndex: 'tabindex',
  srcSet: 'srcset',
  fetchPriority: 'fetchpriority',
  autoComplete: 'autocomplete',
  inputMode: 'inputmode',
  maxLength: 'maxlength',
  strokeWidth: 'stroke-width',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
}

const cssText = (style: CSSProperties) =>
  Object.entries(style)
    .map(([k, v]) => `${k.startsWith('--') ? k : k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${v}`)
    .join(';')

function toHtml(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return esc(node)
  if (Array.isArray(node)) return node.map(toHtml).join('')
  if (!isValidElement(node)) return ''
  const { type } = node
  const props = node.props as Record<string, unknown> & { children?: ReactNode }
  if (type === Fragment) return toHtml(props.children)
  if (typeof type === 'function') return toHtml((type as (p: unknown) => ReactNode)(props))
  if (typeof type !== 'string') return ''

  let attrs = ''
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || key === 'dangerouslySetInnerHTML' || key === 'suppressHydrationWarning') continue
    if (value === null || value === undefined || value === false) continue
    const name = ATTR[key] || key
    if (key === 'style') attrs += ` style="${esc(cssText(value as CSSProperties))}"`
    else attrs += value === true ? ` ${name}` : ` ${name}="${esc(value)}"`
  }
  if (VOID.has(type)) return `<${type}${attrs}>`
  const inner = (props.dangerouslySetInnerHTML as { __html?: string } | undefined)?.__html ?? toHtml(props.children)
  return `<${type}${attrs}>${inner}</${type}>`
}
