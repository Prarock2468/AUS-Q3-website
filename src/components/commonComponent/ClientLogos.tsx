import { media } from '@/lib/media'
import type { ClientLogosBlock } from '@/payload-types'

/**
 * "Trusted by global brands" logo strip (section.brands). The list is drawn twice (the second copy hidden from
 * screen readers) so the CSS marquee loops seamlessly.
 */
export function ClientLogos({ block, anchorId }: { block: ClientLogosBlock; anchorId?: string | null }) {
  const logos = (block.logos || []).flatMap((l) => {
    const m = media(l.logo)
    return m?.url ? [{ id: l.id, name: l.name, url: l.url, src: m.url }] : []
  })
  if (!logos.length) return null

  const item = (l: (typeof logos)[number], copy: boolean) => {
    const img = <img src={l.src} alt={l.name} width={150} height={40} loading="lazy" decoding="async" />
    return (
      <li key={`${copy ? 'b' : 'a'}${l.id}`} aria-hidden={copy ? 'true' : undefined}>
        {l.url && !copy ? <a href={l.url}>{img}</a> : img}
      </li>
    )
  }

  return (
    <section className="brands" aria-label="Clients" id={anchorId || undefined}>
      <div className="wrap" suppressHydrationWarning>
        <p className="brands-title">{block.heading || 'Trusted By Global Brands'}</p>
      </div>
      <div className="brand-marquee">
        <ul className="brand-track">
          {logos.map((l) => item(l, false))}
          {logos.map((l) => item(l, true))}
        </ul>
      </div>
    </section>
  )
}
