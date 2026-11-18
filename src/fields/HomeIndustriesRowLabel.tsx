'use client'
import { useRowLabel } from '@payloadcms/ui'

/** Collapsed-row title for an industry in "Industries we serve (home page)". */
export function HomeIndustriesRowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <span>{data?.title || `Industry ${(rowNumber ?? 0) + 1}`}</span>
}
