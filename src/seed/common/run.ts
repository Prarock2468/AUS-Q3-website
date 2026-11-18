/** Creates the starter Common Component entries if they do not exist yet. Safe to run more than once. */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'

const entries = [
  { title: 'Client Logos', key: 'client-logos', layout: [{ blockType: 'clientLogos', heading: 'Trusted By Global Brands' }] },
  { title: 'Testimonial Slider', key: 'testimonial-slider', layout: [{ blockType: 'testimonialSlider', heading: 'Testimonials' }] },
] as const

const payload = await getPayload({ config })
for (const entry of entries) {
  const existing = await payload.find({ collection: 'commonComponent', where: { key: { equals: entry.key } }, limit: 1 })
  if (existing.docs.length) {
    payload.logger.info(`Exists: ${entry.title}`)
    continue
  }
  await payload.create({ collection: 'commonComponent', data: entry as any })
  payload.logger.info(`Created: ${entry.title}`)
}
process.exit(0)
