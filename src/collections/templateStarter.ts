import type { Endpoint, PayloadRequest } from 'payload'
import { PAGE_TEMPLATE_OPTIONS } from '../templates'

/**
 * Default sections for a page template, copied from that template's starter page: the published page with
 * "Starter for new pages" ticked, otherwise the oldest published page using the template.
 */
export async function findTemplateStarter(req: PayloadRequest, template: string) {
  const base = { template: { equals: template }, _status: { equals: 'published' } } as const
  for (const where of [{ ...base, isTemplateStarter: { equals: true } }, base]) {
    const { docs } = await req.payload.find({
      collection: 'pages',
      where,
      sort: 'createdAt',
      limit: 1,
      depth: 0,
      draft: false,
      req,
      select: { title: true, path: true, layout: true, mainClass: true },
    })
    if (docs[0]) return docs[0]
  }
  return null
}

/**
 * Row ids are primary keys in the database, so copied blocks and array rows need new ones. Rich-text (Lexical)
 * nodes carry a `version` and are left alone.
 */
function withoutRowIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutRowIds)
  if (!value || typeof value !== 'object') return value
  const out: Record<string, unknown> = {}
  const isLexicalNode = 'version' in value && 'type' in value
  for (const [key, v] of Object.entries(value)) {
    if (key === 'id' && !isLexicalNode && typeof v === 'string') continue
    out[key] = key === 'root' ? v : withoutRowIds(v)
  }
  return out
}

/** GET /api/pages/template-starter?template=service → { layout, mainClass, sourceTitle, sourcePath } */
export const templateStarterEndpoint: Endpoint = {
  path: '/template-starter',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Log in to load template sections.' }, { status: 401 })
    const template = new URL(req.url || '', 'http://localhost').searchParams.get('template') || ''
    if (!PAGE_TEMPLATE_OPTIONS.some((o) => o.value === template)) {
      return Response.json({ error: 'Unknown template.' }, { status: 400 })
    }
    const starter = await findTemplateStarter(req, template)
    if (!starter) return Response.json({ layout: [], mainClass: null, sourceTitle: null, sourcePath: null })
    return Response.json({
      layout: withoutRowIds(starter.layout || []),
      mainClass: starter.mainClass || null,
      sourceTitle: starter.title,
      sourcePath: starter.path,
    })
  },
}
