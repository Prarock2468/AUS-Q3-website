import { HtmlElements } from '@/components/sharedComponent'
import { getPayloadClient, getSettings, isDraft } from '@/lib/data'
import { renderBlock, type Block } from '@/lib/render/blocks'

/**
 * Renders a saved Common Component entry by its key, for example <CommonComponent componentKey="client-logos" />.
 * In the page builder, editors use the "Common component (saved)" section instead.
 */
export async function CommonComponent({ componentKey }: { componentKey: string }) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'commonComponent',
    where: { key: { equals: componentKey } },
    depth: 0,
    limit: 1,
    overrideAccess: await isDraft(),
  })
  if (!docs[0]) return null
  const block = { blockType: 'commonComponentRef', component: docs[0].id } as Block
  return <HtmlElements html={await renderBlock(block, await getSettings())} />
}
