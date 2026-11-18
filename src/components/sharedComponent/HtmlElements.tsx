import { createElement, Fragment, type CSSProperties, type ReactNode } from 'react'

/**
 * Renders CMS-authored HTML as real React elements, one per top-level tag, with each element's inner markup kept
 * as server HTML. React owns the outer tags (so templates can be composed from components), while the content
 * inside stays exactly as authored, so the site's original scripts can enhance it without React fighting them.
 *
 * Markup that can't be split cleanly (stray top-level text, unbalanced tags, inline event handlers) falls back to
 * a `display: contents` wrapper, which renders the same but adds one element to the DOM.
 */
export function HtmlElements({ html }: { html: string | null | undefined }): ReactNode {
  if (!html || !html.trim()) return null
  const elements = splitTopLevel(html)
  if (!elements) {
    return <div style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
  }
  return (
    <>
      {elements.map((el, i) => (
        <Fragment key={i}>{toReactElement(el)}</Fragment>
      ))}
    </>
  )
}

type TopLevel = { tag: string; attrs: string; inner: string; isVoid: boolean }

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title'])
const TAG =
  /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g

/** Split an HTML string into its top-level elements, or return null if it isn't a clean list of elements. */
function splitTopLevel(html: string): TopLevel[] | null {
  const out: TopLevel[] = []
  const stack: string[] = []
  let current: { tag: string; attrs: string; innerStart: number } | null = null
  let lastEnd = 0
  const re = new RegExp(TAG.source, 'g')
  let m: RegExpExecArray | null

  while ((m = re.exec(html))) {
    if (stack.length === 0 && html.slice(lastEnd, m.index).trim()) return null
    lastEnd = re.lastIndex
    if (m[0].startsWith('<!--')) continue

    const [, slash, tag, attrs, selfClose] = m
    const name = tag.toLowerCase()

    if (slash) {
      if (stack[stack.length - 1] !== name) return null
      stack.pop()
      if (stack.length === 0 && current) {
        out.push({ tag: current.tag, attrs: current.attrs, inner: html.slice(current.innerStart, m.index), isVoid: false })
        current = null
      }
      continue
    }

    if (stack.length === 0) current = { tag, attrs, innerStart: re.lastIndex }

    if (VOID.has(name) || selfClose) {
      if (stack.length === 0 && current) {
        out.push({ tag: current.tag, attrs: current.attrs, inner: '', isVoid: true })
        current = null
      }
      continue
    }

    if (RAW_TEXT.has(name)) {
      if (stack.length === 0 && name === 'textarea') return null
      const close = html.toLowerCase().indexOf(`</${name}`, re.lastIndex)
      if (close === -1) return null
      re.lastIndex = close
    }
    stack.push(name)
  }

  if (stack.length || html.slice(lastEnd).trim()) return null
  for (const el of out) if (/\son[a-z]+\s*=/i.test(el.attrs)) return null
  return out
}

function toReactElement(el: TopLevel) {
  const props: Record<string, unknown> = { ...parseAttributes(el.attrs), suppressHydrationWarning: true }
  if (!el.isVoid) props.dangerouslySetInnerHTML = { __html: el.inner }
  return createElement(el.tag, props)
}

/** HTML attribute names whose React prop name differs. Everything else (aria-*, data-*, id, href …) passes through. */
const PROP_NAMES: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  srcset: 'srcSet',
  fetchpriority: 'fetchPriority',
  crossorigin: 'crossOrigin',
  referrerpolicy: 'referrerPolicy',
  allowfullscreen: 'allowFullScreen',
  autoplay: 'autoPlay',
  autofocus: 'autoFocus',
  autocomplete: 'autoComplete',
  playsinline: 'playsInline',
  enctype: 'encType',
  novalidate: 'noValidate',
  formnovalidate: 'formNoValidate',
  nomodule: 'noModule',
  itemscope: 'itemScope',
  itemprop: 'itemProp',
  itemtype: 'itemType',
  datetime: 'dateTime',
  hreflang: 'hrefLang',
  inputmode: 'inputMode',
  enterkeyhint: 'enterKeyHint',
  contenteditable: 'contentEditable',
  spellcheck: 'spellCheck',
  accesskey: 'accessKey',
  'accept-charset': 'acceptCharset',
  'http-equiv': 'httpEquiv',
}

const BOOLEAN = new Set([
  'allowFullScreen', 'async', 'autoFocus', 'autoPlay', 'checked', 'controls', 'default', 'defer', 'disabled',
  'formNoValidate', 'hidden', 'inert', 'itemScope', 'loop', 'multiple', 'muted', 'noModule', 'noValidate', 'open',
  'playsInline', 'readOnly', 'required', 'reversed', 'selected',
])

const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

function parseAttributes(attrs: string): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  for (const m of attrs.matchAll(ATTR)) {
    const raw = m[1]
    const value = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '')
    const name = PROP_NAMES[raw.toLowerCase()] ?? raw
    if (name === 'style') props.style = parseStyle(value)
    else if (BOOLEAN.has(name)) props[name] = value === '' || value.toLowerCase() === raw.toLowerCase() ? true : value
    else props[name] = value
  }
  return props
}

/** "color:red; --fill:40%" → { color: 'red', '--fill': '40%' }. Semicolons inside url(...) are kept. */
function parseStyle(css: string): CSSProperties {
  const style: Record<string, string> = {}
  let depth = 0
  let start = 0
  const parts: string[] = []
  for (let i = 0; i <= css.length; i++) {
    const c = css[i]
    if (c === '(') depth++
    else if (c === ')') depth--
    else if ((c === ';' && depth === 0) || i === css.length) {
      parts.push(css.slice(start, i))
      start = i + 1
    }
  }
  for (const part of parts) {
    const colon = part.indexOf(':')
    if (colon === -1) continue
    const prop = part.slice(0, colon).trim()
    const value = part.slice(colon + 1).trim()
    if (!prop) continue
    const key = prop.startsWith('--')
      ? prop
      : prop.toLowerCase().replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    style[key] = value
  }
  return style as CSSProperties
}

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(s: string): string {
  if (!s.includes('&')) return s
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : m
    }
    return NAMED[e.toLowerCase()] ?? m
  })
}
