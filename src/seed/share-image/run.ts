/**
 * Site settings → Default social sharing image: moves the old image address (a file in /public) into the new upload
 * field, reusing the Media item with the same file name or uploading the file. Does nothing when an image is already
 * chosen, or the address is not a file in /public. Safe to run more than once: `npm run seed:share-image`.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '../../payload.config'

const payload = await getPayload({ config })
const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

if (settings.defaultShareImage) {
  payload.logger.info('Default social sharing image is already chosen; left as is.')
  process.exit(0)
}
const address = (settings.defaultOgImage || '').trim()
const file = address.startsWith('/') ? path.join(process.cwd(), 'public', address.split('?')[0]) : ''
if (!file || !fs.existsSync(file)) {
  payload.logger.info(`Old image address "${address}" is not a file in /public; choose the image in Site settings instead.`)
  process.exit(0)
}

const filename = path.basename(file)
const found = (await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })).docs[0]
let id = found?.id
if (!id) {
  const data = fs.readFileSync(file)
  const ext = path.extname(filename).toLowerCase()
  const mimetype = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : ext === '.avif' ? 'image/avif' : 'image/jpeg'
  id = (await payload.create({ collection: 'media', data: { alt: '' }, file: { data, mimetype, name: filename, size: data.length } })).id
  payload.logger.info(`Uploaded ${filename} to Media.`)
}
await payload.updateGlobal({ slug: 'site-settings', data: { defaultShareImage: id } })
payload.logger.info(`Default social sharing image is now ${filename} (Media ${id}).`)
process.exit(0)
