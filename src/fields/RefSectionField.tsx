'use client'
import { ArrayField, SelectField, useConfig, useField } from '@payloadcms/ui'
import type { ArrayFieldClientProps, SelectFieldClientProps } from 'payload'
import { useEffect, useState } from 'react'

/** A section of a saved Common Component entry, as returned by the API (depth 0). */
export type EntrySection = { blockType?: string; [key: string]: unknown }

/** Per Common Component entry id: its sections. */
const entryCache = new Map<string, EntrySection[]>()

/**
 * The sections of the Common Component entry picked in the same "Common component (saved)" section as the field at
 * `path` (its sibling `component` field), or undefined while loading / when none is picked.
 */
export function useRefEntrySections(path: string): EntrySection[] | undefined {
  const { value: component } = useField<number | string | { id?: number | string } | null>({
    path: path.replace(/[^.]+$/, 'component'),
  })
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const id = component && typeof component === 'object' ? component.id : component
  const key = id == null || id === '' ? '' : String(id)
  // Bumped when a lookup finishes, so the component re-renders and reads the cache.
  const [, setChecked] = useState(0)

  useEffect(() => {
    if (!key || entryCache.has(key)) return
    let cancelled = false
    fetch(`${serverURL}${api}/commonComponent/${encodeURIComponent(key)}?depth=0&draft=true`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((doc: { layout?: EntrySection[] } | null) => {
        entryCache.set(key, doc?.layout || [])
        if (!cancelled) setChecked((n) => n + 1)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [key, serverURL, api])

  return key ? entryCache.get(key) : undefined
}

type Props = (ArrayFieldClientProps | SelectFieldClientProps) & {
  /** Show the field only when the picked entry contains a section of this type, e.g. "faq". */
  requires: string
}

/**
 * A page-only override field in a "Common component (saved)" section ("FAQs for this page", "FAQ style for this
 * page"). It only shows when the picked entry contains the matching section (`requires`), so for example Client
 * logos shows neither. A value that is already saved keeps showing, so it can still be seen and cleared.
 */
export function RefSectionField(props: Props) {
  const { requires, ...fieldProps } = props
  const path = fieldProps.path || fieldProps.field.name
  const sections = useRefEntrySections(path)
  // Arrays report their row count as the value; selects the chosen value.
  const { value } = useField<unknown>({ path })

  const show = !!sections?.some((s) => s.blockType === requires)
  const hasValue = typeof value === 'number' ? value > 0 : !!value
  if (!show && !hasValue) return null
  if (fieldProps.field.type === 'array') return <ArrayField {...(fieldProps as ArrayFieldClientProps)} />
  return <SelectField {...(fieldProps as SelectFieldClientProps)} />
}

/** "FAQ style for this page": shown when the picked entry has an FAQ. */
export function RefFaqStyleField(props: SelectFieldClientProps) {
  return <RefSectionField {...props} requires="faq" />
}

/** "FAQs for this page": shown when the picked entry has an FAQ. */
export function RefFaqsField(props: ArrayFieldClientProps) {
  return <RefSectionField {...props} requires="faq" />
}
