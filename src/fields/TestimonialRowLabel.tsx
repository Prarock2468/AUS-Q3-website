'use client'
import { useRowLabel } from '@payloadcms/ui'

/** Collapsed-row title for a testimonial in a Testimonial slider: the person's name and job title. */
export function TestimonialRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string; role?: string }>()
  return (
    <span>
      {data?.name || `Testimonial ${(rowNumber ?? 0) + 1}`}
      {data?.role ? <span style={{ opacity: 0.6 }}> · {data.role}</span> : null}
    </span>
  )
}
