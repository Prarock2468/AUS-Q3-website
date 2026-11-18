'use client'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { lockPageScroll } from '@/lib/scrollLock'

/** Which mobile submenu is open (one at a time, like an accordion). */
const OpenSubmenu = createContext<{ open: string | null; setOpen: (id: string | null) => void }>({
  open: null,
  setOpen: () => {},
})

/** The mobile "Menu" panel. Every submenu starts closed, and closes again whenever the menu is closed. */
export function MobileAccordion({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDetailsElement>(null)

  // Lock page scroll while the menu is open.
  useEffect(() => {
    if (!menuOpen) return
    return lockPageScroll(ref.current?.querySelector<HTMLElement>('.mobile-nav__panel') ?? null)
  }, [menuOpen])

  // The menu is hidden above the mobile breakpoint, so close it there instead of leaving the page locked.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1181px)')
    const onChange = () => {
      if (mq.matches && ref.current) ref.current.open = false
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <OpenSubmenu.Provider value={{ open, setOpen }}>
      <details
        ref={ref}
        className="mobile-nav"
        suppressHydrationWarning
        onToggle={(e) => {
          const isOpen = e.currentTarget.open
          setMenuOpen(isOpen)
          if (!isOpen) setOpen(null)
        }}
      >
        {children}
      </details>
      {/* Dimmed overlay behind the open menu, rendered on <body> so the header's backdrop-filter can't clip it.
          It sits under the header (z-index 100); tapping it closes the menu. */}
      {menuOpen &&
        createPortal(
          <div
            className="mobile-nav__overlay"
            aria-hidden="true"
            onClick={() => {
              if (ref.current) ref.current.open = false
            }}
          />,
          document.body,
        )}
    </OpenSubmenu.Provider>
  )
}

/**
 * The dropdown arrow beside a mobile menu heading, and the submenu it opens. The heading link itself stays a
 * direct child of the panel, because the site script looks it up as `.mobile-nav__panel > a`.
 */
export function MobileSubmenuToggle({ label, children }: { label: string; children: ReactNode }) {
  const { open, setOpen } = useContext(OpenSubmenu)
  const id = useId()
  const expanded = open === id
  return (
    <>
      <button
        type="button"
        className="mobile-nav__toggle"
        aria-expanded={expanded}
        aria-controls={`${id}-sub`}
        aria-label={`${expanded ? 'Close' : 'Open'} ${label} submenu`}
        onClick={() => setOpen(expanded ? null : id)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className="sub" id={`${id}-sub`} hidden={!expanded}>
        {children}
      </div>
    </>
  )
}
