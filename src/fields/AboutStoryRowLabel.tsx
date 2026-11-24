'use client'
import { useRowLabel } from '@payloadcms/ui'

type Row = { year?: string; title?: string }

/** Collapsed-row title for a milestone in "Our story (timeline)": "1996 · Our Foundation". */
export function AboutStoryRowLabel() {
  const { data, rowNumber } = useRowLabel<Row>()
  const text = [data?.year, data?.title].filter(Boolean).join(' · ')
  return <span>{text || `Milestone ${(rowNumber ?? 0) + 1}`}</span>
}
