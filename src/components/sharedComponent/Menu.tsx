import type { ReactNode } from 'react'
import type { MenuItem } from '@/lib/chrome'
import { MobileAccordion } from './MobileAccordion'
import { NavLink, type NavState } from './NavLink'
import { MobileSubMenu, SubMenu } from './SubMenu'

type Props = { items: MenuItem[]; nav: NavState }

/** Desktop main menu: plain links, and dropdowns for items that have submenu items. */
export function Menu({ items, nav }: Props) {
  return (
    <nav className="primary-nav" aria-label="Main">
      {items.map((item) =>
        item.submenu.length ? (
          <SubMenu key={item.id} item={item} nav={nav} />
        ) : (
          <NavLink key={item.id} href={item.href || '#'} nav={nav} newTab={item.newTab}>
            {item.label}
          </NavLink>
        ),
      )}
    </nav>
  )
}

/** Mobile menu: the same items in the "Menu" panel, submenus as an accordion, then `children` (the Contact button). */
export function MobileMenu({ items, nav, children }: Props & { children?: ReactNode }) {
  return (
    <MobileAccordion>
      <summary aria-label="Menu">
        {/* Three bars that animate into a cross while the menu is open (styles in header-menu.css). */}
        <span className="mobile-nav__icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="visually-hidden">Menu</span>
      </summary>
      {/* data-lenis-prevent: let the panel scroll natively on pages that use Lenis smooth scrolling. */}
      <div className="mobile-nav__panel" data-lenis-prevent="">
        {items.map((item) =>
          item.submenu.length ? (
            <MobileSubMenu key={item.id} item={item} nav={nav} />
          ) : (
            <NavLink key={item.id} href={item.href || '#'} nav={nav} newTab={item.newTab}>
              {item.label}
            </NavLink>
          ),
        )}
        {children}
      </div>
    </MobileAccordion>
  )
}
