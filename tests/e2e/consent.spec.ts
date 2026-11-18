import { expect, test } from '@playwright/test'

/**
 * Google Consent Mode must be set to "denied" before anything else runs, on every template (including those without
 * the cookie banner), and a visitor's stored "accepted" choice must be applied straight away on later pages.
 */
const PAGES = ['/', '/industries/sports', '/services/software-development', '/about']

type ConsentCall = { cmd: string; type: string; state: Record<string, string> }
const consentCalls = () =>
  ((window as any).dataLayer as unknown[])
    .filter((e: any) => e && typeof e === 'object' && 'length' in e && e[0] === 'consent')
    .map((e: any) => ({ cmd: e[0], type: e[1], state: e[2] }))

for (const path of PAGES) {
  test(`consent defaults to denied first on ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    // Next.js's own framework chunks may come first; the consent defaults must precede every inline, site or GTM script.
    const firstTagScript = await page.evaluate(() => {
      const s = [...document.querySelectorAll('script')].find((el) => !el.src || el.src.includes('/js/') || el.src.includes('googletagmanager'))
      return s?.textContent || s?.src || ''
    })
    expect(firstTagScript).toContain('gtag("consent","default"')

    const calls: ConsentCall[] = await page.evaluate(consentCalls)
    expect(calls[0]).toMatchObject({ type: 'default', state: { analytics_storage: 'denied', ad_storage: 'denied' } })
    expect(calls.some((c) => c.type === 'update' && c.state.analytics_storage === 'granted')).toBe(false)
  })

  test(`stored acceptance is applied on ${path}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('q3au-consent', 'accepted'))
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    const calls: ConsentCall[] = await page.evaluate(consentCalls)
    expect(calls[0].type).toBe('default')
    expect(calls.find((c) => c.type === 'update')?.state.analytics_storage).toBe('granted')
    // Advertising storage is never granted by the banner.
    expect(calls.some((c) => c.state.ad_storage === 'granted' || c.state.ad_user_data === 'granted')).toBe(false)
  })
}
