'use client'
import { useRowLabel } from '@payloadcms/ui'

type Row = { title?: string; subServices?: unknown[] }

/** Collapsed-row title for a service in "Our services (home page)": its title and how many sub-services it has. */
export function HomeServicesRowLabel() {
  const { data, rowNumber } = useRowLabel<Row>()
  const count = data?.subServices?.length || 0
  return (
    <span>
      {data?.title || `Service ${(rowNumber ?? 0) + 1}`}
      {count ? <span style={{ opacity: 0.6 }}> · {count} sub-services</span> : null}
    </span>
  )
}
