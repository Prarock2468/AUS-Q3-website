const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'])

/**
 * Stops the page from scrolling while an overlay (mobile menu, search dialog) is open; `allow` (the overlay's own
 * panel) still scrolls. Returns a function that unlocks again.
 *
 * It never touches overflow or position on <html>/<body> (that made the page jump back to the top); instead
 * wheel, touch-move and scroll-key events outside `allow` are cancelled in the capture phase, before Lenis smooth
 * scrolling sees them, so the scroll position never changes. Typing in form fields is left alone.
 */
export function lockPageScroll(allow: HTMLElement | null): () => void {
  const inside = (e: Event) => !!allow && e.target instanceof Node && allow.contains(e.target)
  const block = (e: Event) => {
    if (inside(e)) return
    e.preventDefault()
    e.stopPropagation()
  }
  const blockKeys = (e: KeyboardEvent) => {
    if (!SCROLL_KEYS.has(e.key) || inside(e)) return
    const t = e.target as HTMLElement | null
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
    e.preventDefault()
  }
  const opts = { capture: true, passive: false } as const
  window.addEventListener('wheel', block, opts)
  window.addEventListener('touchmove', block, opts)
  window.addEventListener('keydown', blockKeys, opts)

  return () => {
    window.removeEventListener('wheel', block, opts)
    window.removeEventListener('touchmove', block, opts)
    window.removeEventListener('keydown', blockKeys, opts)
  }
}
