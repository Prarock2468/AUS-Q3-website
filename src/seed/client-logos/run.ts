/**
 * Moves the home page client logos into Common Component → "Client Logos" (key `client-logos`):
 *  1. Reads the logos from Site settings → Shared sections → Client logos (the old HTML strip).
 *  2. Uploads each logo to Media (reusing ones already uploaded). The Media collection does not accept SVG (an
 *     uploaded SVG can carry script), so SVG logos are converted to sharp WebP; WebP logos use their @2x file.
 *  3. Fills the Client Logos entry with those logos, in the same order (skipped when it already has logos,
 *     unless run with --force).
 *  4. On the home page, swaps the "Shared section → Client logos" section for "Common component (saved) →
 *     Client Logos", in the same position.
 * Safe to run more than once: `npm run seed:client-logos` (add `-- --force` to rebuild the logo list).
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '../../payload.config'

const FORCE = process.argv.includes('--force')
const PUBLIC = path.resolve(process.cwd(), 'public')
const context = { disableRevalidate: true }

const payload = await getPayload({ config })
const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as unknown as { brands?: string | null }

// 1. Logos from the old shared HTML (first copy only: the second copy is the marquee's hidden duplicate).
const $ = cheerio.load(settings.brands || '')
const heading = $('.brands-title').first().text().trim() || 'Trusted By Global Brands'
const sources = $('.brand-track > li:not([aria-hidden]) img')
  .toArray()
  .map((img) => ({ name: ($(img).attr('alt') || '').trim(), src: $(img).attr('src') || '' }))
  .filter((l) => l.name && l.src.startsWith('/'))
if (!sources.length) throw new Error('No logos found in Site settings → Shared sections → Client logos.')
payload.logger.info(`Found ${sources.length} logos in Site settings.`)

// 2. Upload to Media.
async function uploadLogo({ name, src }: { name: string; src: string }): Promise<number> {
  const ext = path.extname(src).toLowerCase()
  const base = path.basename(src, ext)
  const isSvg = ext === '.svg'
  const filename = isSvg ? `${base}.webp` : `${base}${ext}`

  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
  if (existing.docs[0]) return existing.docs[0].id as number

  const file = path.join(PUBLIC, src)
  const retina = path.join(PUBLIC, path.dirname(src), `${base}@2x${ext}`)
  let data: Buffer
  if (isSvg) {
    // 3x the 40px display height, so the logo stays sharp on high-density screens.
    data = await sharp(file, { density: 600 }).resize({ height: 120, withoutEnlargement: false }).webp({ quality: 90 }).toBuffer()
  } else {
    data = fs.readFileSync(fs.existsSync(retina) ? retina : file)
  }
  const mimetype = isSvg || ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg'
  const doc = await payload.create({
    collection: 'media',
    data: { alt: name },
    file: { data, mimetype, name: filename, size: data.length },
    context,
  })
  payload.logger.info(`Uploaded ${filename}${isSvg ? ' (converted from SVG)' : ''}`)
  return doc.id as number
}

// 3. Fill the Client Logos common component.
const { docs: entries } = await payload.find({
  collection: 'commonComponent',
  where: { key: { equals: 'client-logos' } },
  depth: 0,
  limit: 1,
})
let entry = entries[0]
if (!entry) {
  entry = await payload.create({
    collection: 'commonComponent',
    data: { title: 'Client Logos', key: 'client-logos', layout: [{ blockType: 'clientLogos', heading }] },
    context,
  })
}
const layout = [...(entry.layout || [])]
let index = layout.findIndex((b) => b.blockType === 'clientLogos')
if (index < 0) {
  layout.unshift({ blockType: 'clientLogos', heading })
  index = 0
}
const block = layout[index] as Extract<(typeof layout)[number], { blockType: 'clientLogos' }>
if (block.logos?.length && !FORCE) {
  payload.logger.info(`Client Logos already has ${block.logos.length} logos; kept them (use --force to rebuild).`)
} else {
  const logos = []
  for (const s of sources) logos.push({ name: s.name, logo: await uploadLogo(s) })
  layout[index] = { ...block, heading: block.heading || heading, logos }
  await payload.update({ collection: 'commonComponent', id: entry.id, data: { layout }, context })
  payload.logger.info(`Client Logos now has ${logos.length} logos.`)
}

// 4. Point the home page at the common component.
const { docs: homes } = await payload.find({
  collection: 'pages',
  where: { path: { equals: '/' } },
  depth: 0,
  limit: 1,
  draft: true,
})
const home = homes[0]
if (!home) {
  payload.logger.warn('Home page not found; add "Common component (saved) → Client Logos" to it by hand.')
} else {
  const sections = [...(home.layout || [])]
  const old = sections.findIndex((b) => b.blockType === 'sharedSection' && b.section === 'brands')
  const already = sections.some(
    (b) => b.blockType === 'commonComponentRef' && (typeof b.component === 'object' ? b.component?.id : b.component) === entry.id,
  )
  if (already) {
    payload.logger.info('Home page already uses the Client Logos common component.')
  } else if (old < 0) {
    payload.logger.warn('Home page has no "Shared section → Client logos"; nothing replaced.')
  } else {
    const anchorId = (sections[old] as { anchorId?: string | null }).anchorId
    sections[old] = { blockType: 'commonComponentRef', component: entry.id, anchorId }
    await payload.update({
      collection: 'pages',
      id: home.id,
      data: { layout: sections, _status: home._status === 'published' ? 'published' : home._status },
      context,
    })
    payload.logger.info('Home page now uses Common component → Client Logos (in the same position).')
  }
}
process.exit(0)
