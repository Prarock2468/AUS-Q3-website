import { HtmlElements } from '@/components/sharedComponent'
import { renderClientLogos } from '@/lib/render/common'
import type { ClientLogosBlock } from '@/payload-types'

/** "Trusted by global brands" logo strip (section.brands). Markup lives in src/lib/render/common.ts. */
export function ClientLogos({ block }: { block: ClientLogosBlock }) {
  return <HtmlElements html={renderClientLogos(block)} />
}
