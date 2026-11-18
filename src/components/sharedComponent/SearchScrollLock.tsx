'use client'
import { useEffect } from 'react'
import { lockPageScroll } from '@/lib/scrollLock'

/**
 * Stops the page scrolling while the search dialog (`dialog#search`, from the Site settings HTML, opened by the
 * site script) is open, like the mobile menu. It watches the dialog's `open` attribute, so it works however the
 * dialog is opened or closed (button, Ctrl/Cmd+K, "/", Esc, close button, backdrop click). Renders nothing.
 */
export function SearchScrollLock() {
  useEffect(() => {
    let unlock: (() => void) | null = null
    const sync = () => {
      const dialog = document.querySelector<HTMLDialogElement>('dialog#search')
      if (dialog?.open && !unlock) {
        unlock = lockPageScroll(dialog.querySelector<HTMLElement>('.search-panel'))
      } else if (!dialog?.open && unlock) {
        unlock()
        unlock = null
      }
    }
    // Only `open` attributes are watched, so this stays cheap.
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
    sync()
    return () => {
      observer.disconnect()
      unlock?.()
    }
  }, [])
  return null
}
