import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { INDUSTRIES } from '../../src/seed/industries'

/** Scroll through the page so scroll-triggered animations finish and every lazy image loads. */
async function settle(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(60)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForLoadState('networkidle')
}

for (const { slug, name } of INDUSTRIES) {
  const url = `/industries/${slug}`

  test.describe(name, () => {
    test('loads without errors, broken images or broken links', async ({ page, request }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`))

      await page.goto(url, { waitUntil: 'networkidle' })
      await settle(page)

      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('.breadcrumb [aria-current="page"]')).toHaveText(name)
      await expect(page.locator('main img:not([alt])')).toHaveCount(0)
      const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src))
      expect(broken).toEqual([])

      const hrefs = await page.evaluate(() => [
        ...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')!.split('#')[0]).filter(Boolean)),
      ])
      for (const href of hrefs) expect((await request.get(href, { maxRedirects: 0 })).status(), href).toBeLessThan(400)

      for (const other of INDUSTRIES) await expect(page.locator(`header a[href="/industries/${other.slug}"]`).first()).toBeAttached()
      expect(errors).toEqual([])
    })

    test('What we do accordion opens with mouse and keyboard', async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      await settle(page)
      const buttons = page.locator('.wwd-card__btn')
      const count = await buttons.count()
      expect(count).toBeGreaterThan(1)

      await page.locator('#wwd-btn-2').click()
      await expect(page.locator('#wwd-btn-2')).toHaveAttribute('aria-expanded', 'true')
      await expect(page.locator('#wwd-btn-1')).toHaveAttribute('aria-expanded', 'false')
      await expect(page.locator('#wwd-panel-1')).toHaveAttribute('inert', '')

      await page.locator(`#wwd-btn-${count}`).focus()
      await page.keyboard.press('Enter')
      await expect(page.locator(`#wwd-btn-${count}`)).toHaveAttribute('aria-expanded', 'true')
    })

    test('FAQs open and every answer has text', async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      const items = page.locator('div.faq details')
      expect(await items.count()).toBeGreaterThan(4)
      const first = items.first()
      const wasOpen = await first.evaluate((d: HTMLDetailsElement) => d.open)
      await first.locator('summary').click()
      expect(await first.evaluate((d: HTMLDetailsElement) => d.open)).toBe(!wasOpen)
      const answers = await items.evaluateAll((ds) => ds.map((d) => d.textContent!.replace(d.querySelector('summary')!.textContent!, '').trim().length))
      for (const length of answers) expect(length).toBeGreaterThan(20)
    })

    test('no horizontal scrolling', async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      await settle(page)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })

    test('no WCAG 2.1 AA violations', async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      await settle(page)
      // Measure final colours, not a button halfway through its hover/reveal transition.
      await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' })
      await page.mouse.move(0, 0)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })

    test('current breadcrumb item is readable over the hero photo', async ({ page }) => {
      // axe cannot measure text over images, so check the colour directly: it must stay light on the dark hero.
      await page.goto(url, { waitUntil: 'networkidle' })
      const [r, g, b] = await page
        .locator('.ind-hero .breadcrumb [aria-current="page"]')
        .evaluate((el) => getComputedStyle(el).color.match(/\d+/g)!.map(Number))
      const lum = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      expect(0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2]).toBeGreaterThan(0.6)
    })
  })
}
