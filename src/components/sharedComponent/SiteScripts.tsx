'use client'
import { useEffect } from 'react'

let started = false

/**
 * Loads the template's original site scripts (header menu, sliders, scroll reveal…, from TEMPLATES in
 * src/templates.ts) once React has hydrated the page, in their original order.
 *
 * Why after hydration: these scripts change the page on start (they add classes such as `sr` and styles such as
 * --sr-delay, split headings, add buttons). Run before hydration, React would find markup it did not render and
 * warn ("A tree hydrated but some attributes … didn't match"), or redraw the page. After hydration React no longer
 * compares, so the scripts can change anything.
 *
 * If the page has already finished loading by then, the `load` handlers the scripts add (re-measuring, lazy video)
 * are run straight away, since the window `load` event will not fire again.
 */
export function SiteScripts({ srcs }: { srcs: string[] }) {
  useEffect(() => {
    if (started) return
    started = true

    const addEventListener = window.addEventListener
    const loadedAlready = document.readyState === 'complete'
    if (loadedAlready) {
      window.addEventListener = function (this: Window, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
        if (type === 'load' && listener) {
          const event = new Event('load')
          setTimeout(() => (typeof listener === 'function' ? listener.call(window, event) : listener.handleEvent(event)))
          return
        }
        if (listener) addEventListener.call(this, type, listener, options)
      } as typeof window.addEventListener
    }

    srcs.forEach((src, i) => {
      const script = document.createElement('script')
      script.src = src
      script.async = false // run in the order given, like the original deferred scripts
      if (i === srcs.length - 1 && loadedAlready) {
        script.onload = script.onerror = () => {
          window.addEventListener = addEventListener
        }
      }
      document.body.appendChild(script)
    })
  }, [srcs])

  return null
}
