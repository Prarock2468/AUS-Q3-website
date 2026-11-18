import type { HeaderMenu, SiteSetting } from '@/payload-types'

const OUR_WORK = ['/case-studies', '/client-testimonials', '/clients', '/ui-ux-work']

type RawItem = NonNullable<HeaderMenu['items']>[number]
type RawLink = Pick<RawItem, 'type' | 'reference' | 'label' | 'link' | 'newTab'>

/** A menu link ready to render: `href` is null for plain-text submenu items. */
export type MenuLink = { id: string; label: string; href: string | null; newTab: boolean }
export type MenuItem = MenuLink & { submenuStyle: 'wide' | 'compact'; submenu: MenuLink[] }

type LinkedDoc = { title?: string | null; cardTitle?: string | null; path?: string | null; slug?: string | null; _status?: string | null }

const DOC_PATH: Record<string, (doc: LinkedDoc) => string | null> = {
  pages: (d) => d.path || null,
  'case-studies': (d) => (d.slug ? `/case-studies/${d.slug}` : null),
  insights: (d) => (d.slug ? `/insights/${d.slug}` : null),
}

/** Resolve one link. Returns null for a page or post that was deleted or never published, so it drops out of the menu. */
function resolveLink(raw: RawLink, id: string): MenuLink | null {
  const newTab = Boolean(raw.newTab)
  if (raw.type === 'reference' && raw.reference) {
    const doc = raw.reference.value as LinkedDoc | number | string
    if (typeof doc !== 'object' || !doc || doc._status === 'draft') return null
    const href = DOC_PATH[raw.reference.relationTo]?.(doc) ?? null
    if (!href) return null
    const label = raw.label?.trim() || (doc.cardTitle || doc.title || '').replace(/\s+/g, ' ').trim()
    return { id, label, href, newTab }
  }
  // Custom links, and rows saved before "Link to" existed.
  const label = raw.label?.trim()
  return label ? { id, label, href: raw.link?.trim() || null, newTab } : null
}

/** The menu edited in Header Menu → Menu and submenus (loaded with the site settings by getSettings). */
export function headerMenuItems(settings: SiteSetting): MenuItem[] {
  const raw = (settings as SiteSetting & { headerMenu?: HeaderMenu | null }).headerMenu?.items || []
  const out: MenuItem[] = []
  raw.forEach((item, i) => {
    const submenu = (item.submenu || [])
      .map((s, j) => resolveLink(s, s.id || `${i}-${j}`))
      .filter((s): s is MenuLink => Boolean(s))
    const own = resolveLink(item, item.id || String(i))
    // A dropdown can be a custom item without a URL; a plain link needs one.
    if (!own || (!own.href && !submenu.length)) return
    out.push({ ...own, submenuStyle: item.submenuStyle === 'compact' ? 'compact' : 'wide', submenu })
  })
  return out
}

/**
 * Which header links count as the current page, as the original build script decided:
 * the matching link gets aria-current="page", and its dropdown is marked is-current.
 */
export function navState(path: string) {
  const segments = path.split('/').filter(Boolean)
  const section = segments.length > 1 && ['case-studies', 'insights'].includes(segments[0]) ? `/${segments[0]}` : null
  const isIndustryDetail = segments[0] === 'industries' && segments.length > 1
  const parent = isIndustryDetail
    ? 'Industries'
    : OUR_WORK.includes(path) || segments[0] === 'case-studies'
      ? 'Our Work'
      : null

  const isCurrent = (href?: string | null) =>
    Boolean(href) && ((href === path && !isIndustryDetail) || (section !== null && href === section))

  /** A dropdown is current when it is the section's parent or holds the current page's link. */
  const isParentCurrent = (label: string, links: (string | null | undefined)[]) =>
    label === parent || links.some((l) => l && l === path)

  return { isCurrent, isParentCurrent, parent }
}

/** The header HTML from Site settings, with the current page highlighted. Used when Header Menu has no items. */
export function renderHeader(settings: SiteSetting, path: string) {
  const { isCurrent, parent } = navState(path)
  let html = (settings.header || '').replace(/<a ([^>]*?)href="([^"]*)"([^>]*)>/g, (m, a: string, href: string, b: string) =>
    isCurrent(href) && !m.includes('aria-current') ? `<a ${a}href="${href}"${b} aria-current="page">` : m,
  )
  if (parent) {
    html = html.replace(
      new RegExp(`<details class="primary-nav__item">(?=<summary>${parent}</summary>)`),
      '<details class="primary-nav__item is-current">',
    )
  }
  return html
}

export const renderFooter = (settings: SiteSetting) => settings.footer || ''

export const renderExtras = (settings: SiteSetting, kind: 'full' | 'simple' | 'none') =>
  kind === 'full' ? settings.extrasFull || '' : kind === 'simple' ? settings.extrasSimple || '' : ''
