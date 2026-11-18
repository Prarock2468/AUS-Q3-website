/**
 * Pages that were edited in the CMS after the original import, saved so a fresh database (for example the move from
 * SQLite to PostgreSQL) keeps those edits. Each <name>.json is a page as exported from the CMS, without database IDs;
 * "Latest insights" blocks list their posts by slug (postSlugs) and are matched to the new IDs here.
 *
 * Runs as part of `npm run seed`, after the original pages are imported.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const ctx = { disableRevalidate: true }

export async function restoreEditedPages(payload: Payload) {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'))
    for (const block of data.layout || []) {
      if (block.blockType === 'latestInsights' && Array.isArray(block.postSlugs)) {
        const { docs } = await payload.find({ collection: 'insights', where: { slug: { in: block.postSlugs } }, limit: 50, depth: 0 })
        const id = new Map(docs.map((d) => [d.slug, d.id]))
        block.posts = block.postSlugs.map((s: string) => id.get(s)).filter(Boolean)
        delete block.postSlugs
      }
    }
    const existing = await payload.find({ collection: 'pages', where: { path: { equals: data.path } }, limit: 1, depth: 0 })
    const doc = existing.docs[0]
    if (doc) await payload.update({ collection: 'pages', id: doc.id, data, draft: false, context: ctx })
    else await payload.create({ collection: 'pages', data, draft: false, context: ctx })
    console.log('[seed] restored edited page', data.path)
  }
}
