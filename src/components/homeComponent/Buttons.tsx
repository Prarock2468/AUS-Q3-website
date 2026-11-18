import { ArrowIcon } from './icons'

type Button = { id?: string | null; label: string; link: string; style?: 'primary' | 'outline' | null; trackingId?: string | null }

/**
 * The buttons from a "Buttons" field (blocks/home/fields.ts), as the original site's .btn links with the arrow.
 * suppressHydrationWarning: the home script adds hover motion (inline transform) to .btn links before hydration.
 */
export function Buttons({ buttons }: { buttons: Button[] }) {
  return buttons.map((b, i) => (
    <a
      key={b.id || i}
      className={b.style === 'outline' ? 'btn btn-outline' : 'btn btn-primary'}
      href={b.link}
      data-cta={b.trackingId || undefined}
      suppressHydrationWarning
    >
      {b.label}
      <ArrowIcon />
    </a>
  ))
}
