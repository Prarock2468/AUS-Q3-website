import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * The site is small (under 100 pages) and lists, related cards and the search index all draw on several
 * collections, so any publish refreshes the whole site. Pages are rebuilt on their next request.
 */
function revalidateSite(context: Record<string, unknown> | undefined) {
  if (context?.disableRevalidate) return
  // next/cache only works inside the Next.js server (not in seed scripts or the CLI).
  import('next/cache')
    .then(({ revalidatePath }) => revalidatePath('/', 'layout'))
    .catch(() => {})
}

export const revalidateOnChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  // Draft saves do not change the live site.
  if (doc?._status === 'draft' && previousDoc?._status !== 'published') return doc
  revalidateSite(req.context)
  return doc
}

export const revalidateOnDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateSite(req.context)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context)
  return doc
}
