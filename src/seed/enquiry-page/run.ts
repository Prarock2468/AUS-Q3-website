/**
 * Creates the "Enquiry" page (/enquiry) with the Enquiry form section, if it does not exist yet.
 * `npm run seed:enquiry-page` (uses DATABASE_URL, so it runs against whichever database .env points at).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { textToRichText } from '../../fields/richTextValue'

const payload = await getPayload({ config })
const existing = (await payload.find({ collection: 'pages', where: { path: { equals: '/enquiry' } }, limit: 1, depth: 0 })).docs[0]
if (existing) {
  payload.logger.info('/enquiry already exists; left as is.')
  process.exit(0)
}
await payload.create({
  collection: 'pages',
  context: { disableRevalidate: true },
  data: {
    title: 'Enquiry',
    path: '/enquiry',
    template: 'main',
    _status: 'published',
    layout: [
      {
        blockType: 'enquiryForm',
        heading: 'Send us your enquiry',
        text: textToRichText('Tell us what you need and attach any brief or document. We will get back to you shortly.'),
        thanksText: 'We have received your enquiry and sent a confirmation to your email.',
      },
    ],
  } as any,
})
payload.logger.info('Created /enquiry with the Enquiry form.')
process.exit(0)
