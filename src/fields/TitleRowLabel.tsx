'use client'
import { useRowLabel } from '@payloadcms/ui'

/** Collapsed-row title for array rows that have a `title` field (first line of it), e.g. "Agentic AI Development". */
export function TitleRowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  const title = (data?.title || '').split(/\r?\n/).join(' ').trim()
  return <span>{title || `Item ${(rowNumber ?? 0) + 1}`}</span>
}
