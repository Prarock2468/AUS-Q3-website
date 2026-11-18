'use client'
import { useRowLabel } from '@payloadcms/ui'

type Row = { label?: string; type?: 'reference' | 'custom'; link?: string; submenu?: unknown[] }

/** Collapsed-row title in the admin: the label, what it links to, and the submenu count. */
export function HeaderMenuRowLabel() {
  const { data, rowNumber } = useRowLabel<Row>()
  const name = data?.label || (data?.type !== 'custom' ? '(page or post title)' : `Item ${(rowNumber ?? 0) + 1}`)
  const kind = data?.type === 'custom' ? data?.link || 'custom link' : 'page or post'
  const count = data?.submenu?.length || 0
  return (
    <span>
      {name} <span style={{ opacity: 0.6 }}>· {kind}{count ? ` · ${count} submenu items` : ''}</span>
    </span>
  )
}
