import { headerMenuItems, navState, renderHeader } from '@/lib/chrome'
import type { SiteSetting } from '@/payload-types'
import { HtmlElements } from './HtmlElements'
import { MobileMenu, Menu } from './Menu'
import { NavLink } from './NavLink'
import { SearchScrollLock } from './SearchScrollLock'

const ArrowIcon = () => (
  <svg
    className="ico"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

/**
 * Site header, built from Header Menu → Menu and submenus with the original markup and classes.
 * Falls back to the header HTML in Site settings while the menu has no items.
 */
export function SiteHeader({ settings, path }: { settings: SiteSetting; path: string }) {
  const items = headerMenuItems(settings)
  if (!items.length)
    return (
      <>
        <HtmlElements html={renderHeader(settings, path)} />
        <SearchScrollLock />
      </>
    )

  const nav = navState(path)
  return (
    // The site script sets data-tone on the header before React hydrates.
    <header className="site-header" suppressHydrationWarning>
      <div className="wrap">
        <NavLink className="brand" href="/" nav={nav} aria-label="Q3 Technologies">
          <img
            className="brand__dark"
            src="/assets/images/q3-logo.webp"
            alt="Q3 Technologies"
            width={175}
            height={36}
          />
          <img
            className="brand__light"
            src="/assets/images/q3-logo-light.webp"
            alt=""
            width={175}
            height={36}
            aria-hidden="true"
          />
        </NavLink>
        <Menu items={items} nav={nav} />
        <button className="site-header__search" type="button" data-open-search="">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="visually-hidden">Search</span>
        </button>
        <NavLink
          className="btn btn-primary site-header__cta"
          href="/contact"
          nav={nav}
          data-cta="header_contact"
        >
          Contact us <ArrowIcon />
        </NavLink>
        <MobileMenu items={items} nav={nav}>
          <NavLink className="btn btn-primary" href="/contact" nav={nav}>
            Contact us <ArrowIcon />
          </NavLink>
        </MobileMenu>
      </div>
      <SearchScrollLock />
    </header>
  )
}
