import type { AnchorHTMLAttributes } from 'react'
import type { navState } from '@/lib/chrome'

export type NavState = ReturnType<typeof navState>

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; nav: NavState; newTab?: boolean }

/** A header link, marked aria-current="page" when it points at the current page. */
export function NavLink({ href, nav, newTab, children, ...rest }: Props) {
  return (
    <a
      href={href}
      aria-current={nav.isCurrent(href) ? 'page' : undefined}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  )
}
