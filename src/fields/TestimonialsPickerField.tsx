'use client'
import { FieldDescription, FieldLabel, ReactSelect, useConfig, useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import { useEffect, useState } from 'react'
import { TESTIMONIALS_ENTRY_KEY } from '../blocks/common/Testimonials'

type Option = { label: string; value: string }
type Row = { id?: string; name?: string; role?: string }

/** The testimonials in Common Component → Testimonial Slider, loaded once per admin session. */
let cached: Promise<Option[]> | null = null

function loadOptions(serverURL: string, api: string): Promise<Option[]> {
  cached ||= fetch(
    `${serverURL}${api}/commonComponent?where[key][equals]=${encodeURIComponent(TESTIMONIALS_ENTRY_KEY)}&depth=0&limit=1`,
    { credentials: 'include' },
  )
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { docs?: { layout?: { blockType?: string; testimonials?: Row[] }[] }[] } | null) =>
      (data?.docs?.[0]?.layout || [])
        .filter((s) => s.blockType === 'testimonialSlider')
        .flatMap((s) => s.testimonials || [])
        .filter((t): t is Row & { id: string } => !!t.id)
        .map((t) => ({ value: t.id, label: [t.name || 'Unnamed', t.role].filter(Boolean).join(' · ') })),
    )
    .catch(() => {
      cached = null
      return []
    })
  return cached
}

/**
 * "Testimonials to show" in a Testimonials page section: a multi-select (drag to reorder) of the testimonials in
 * Common Component → Testimonial Slider. Stores their row ids.
 */
export function TestimonialsPickerField(props: TextFieldClientProps) {
  const { field, path: fieldPath, readOnly } = props
  const path = fieldPath || field.name
  const { value, setValue } = useField<string[] | null>({ path })
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const [options, setOptions] = useState<Option[] | null>(null)

  useEffect(() => {
    let active = true
    loadOptions(serverURL, api).then((o) => active && setOptions(o))
    return () => {
      active = false
    }
  }, [serverURL, api])

  const picked = Array.isArray(value) ? value : []
  // A picked testimonial that was since deleted still shows (so it can be removed); the site skips it.
  const selected = picked.map((id) => options?.find((o) => o.value === id) || { value: id, label: options ? 'Removed testimonial' : '…' })
  const description = typeof field.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className="field-type" style={{ marginBottom: 'var(--spacing-field, 1.5rem)' }}>
      <FieldLabel label={field.label || 'Testimonials to show'} path={path} />
      <ReactSelect
        isMulti
        isSortable
        isClearable
        disabled={readOnly}
        isLoading={options === null}
        options={options || []}
        value={selected}
        placeholder={options && !options.length ? 'No testimonials yet: add them in Common Component → Testimonial Slider' : 'All testimonials'}
        onChange={(next) => {
          const list = (Array.isArray(next) ? next : next ? [next] : []) as Option[]
          setValue(list.length ? list.map((o) => o.value) : null)
        }}
      />
      {description ? <FieldDescription description={description} path={path} /> : null}
    </div>
  )
}
