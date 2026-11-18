import type { MenuItem } from '@/lib/render/chrome'
import { MobileSubmenuToggle } from './MobileAccordion'
import { NavLink, type NavState } from './NavLink'

type Props = { item: MenuItem; nav: NavState }

/** Desktop dropdown: the item's label opens a mega panel with its submenu links. */
export function SubMenu({ item, nav }: Props) {
  const current = nav.isParentCurrent(item.label, item.submenu.map((s) => s.href))
  return (
    <details className={`primary-nav__item${current ? ' is-current' : ''}`} suppressHydrationWarning>
      <summary>{item.label}</summary>
      <div className={`mega mega--${item.submenuStyle}`} role="list">
        <ul className="mega__list">
          {item.submenu.map((sub) => (
            <li key={sub.id}>
              {sub.href ? (
                <NavLink href={sub.href} nav={nav} newTab={sub.newTab}>
                  {sub.label}
                </NavLink>
              ) : (
                <span className="mega__text">{sub.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}

/** Mobile menu: the heading link, with an arrow that opens its submenu like an accordion. */
export function MobileSubMenu({ item, nav }: Props) {
  const href = item.href || item.submenu.find((s) => s.href)?.href || '#'
  return (
    <>
      <NavLink className="has-sub" href={href} nav={nav} newTab={item.newTab}>
        {item.label}
      </NavLink>
      <MobileSubmenuToggle label={item.label}>
        {item.submenu.map((sub) =>
          sub.href ? (
            <NavLink key={sub.id} href={sub.href} nav={nav} newTab={sub.newTab}>
              {sub.label}
            </NavLink>
          ) : (
            <span key={sub.id} className="sub__text">
              {sub.label}
            </span>
          ),
        )}
      </MobileSubmenuToggle>
    </>
  )
}
