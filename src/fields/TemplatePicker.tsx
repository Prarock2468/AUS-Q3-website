'use client'
import { Button, SelectField, toast, useConfig, useField, useForm } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import { useCallback, useEffect, useRef, useState } from 'react'

type Section = { blockType?: string; label?: string }
type Starter = { layout: Section[]; mainClass: string | null; sourceTitle: string | null; sourcePath: string | null }

/** Identifies a set of sections, to tell whether the editor changed the ones loaded from a template. */
const signature = (layout: Section[] | undefined) => JSON.stringify((layout || []).map((s) => `${s.blockType}:${s.label || ''}`))

/**
 * The page's Template select. Choosing a template loads that template's default sections into Page sections,
 * like starting from a WordPress page template. Sections the editor already has are only replaced after a confirm.
 */
export const TemplatePicker: SelectFieldClientComponent = (props) => {
  const path = props.path || props.field.name
  const { value } = useField<string>({ path })
  const { getData, reset, setModified } = useForm()
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const [loading, setLoading] = useState(false)
  const previous = useRef<string | undefined>(undefined)
  const loaded = useRef<string | null>(null)

  const labelFor = useCallback(
    (template: string) => {
      const option = props.field.options.find((o) => (typeof o === 'string' ? o : o.value) === template)
      const label = typeof option === 'object' ? option.label : option
      return typeof label === 'string' ? label : template
    },
    [props.field.options],
  )

  const loadSections = useCallback(
    async (template: string, fromButton: boolean) => {
      const data = getData() as { layout?: Section[] } & Record<string, unknown>
      const current = data.layout || []
      const untouched = !current.length || loaded.current === signature(current)
      if (!untouched || fromButton) {
        const question = current.length
          ? `Replace the ${current.length} sections on this page with the default sections for the "${labelFor(template)}" template?`
          : `Add the default sections for the "${labelFor(template)}" template?`
        if (!window.confirm(question)) return
      }

      setLoading(true)
      try {
        const res = await fetch(`${serverURL}${api}/pages/template-starter?template=${encodeURIComponent(template)}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error || res.statusText)
        const starter = (await res.json()) as Starter
        if (!starter.layout.length) {
          toast.info(`No default sections for "${labelFor(template)}" yet. Publish a page with this template to use as its starter.`)
          return
        }
        await reset({ ...getData(), template, layout: starter.layout, mainClass: starter.mainClass ?? '' })
        setModified(true)
        loaded.current = signature(starter.layout)
        toast.success(`Added ${starter.layout.length} sections from "${starter.sourceTitle}" (${starter.sourcePath}). Edit them for this page.`)
      } catch (err) {
        toast.error(`Could not load the template sections: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    },
    [api, getData, labelFor, reset, serverURL, setModified],
  )

  // Load the sections when the editor picks a different template (not when the page first opens).
  useEffect(() => {
    if (previous.current === undefined) {
      previous.current = value || ''
      return
    }
    if (value && value !== previous.current) {
      previous.current = value
      void loadSections(value, false)
    }
  }, [value, loadSections])

  return (
    <div>
      <SelectField {...props} />
      {value ? (
        <Button
          buttonStyle="secondary"
          size="small"
          disabled={loading}
          onClick={() => void loadSections(value, true)}
          tooltip="Replace Page sections with this template’s default sections"
        >
          {loading ? 'Loading sections…' : 'Load template sections'}
        </Button>
      ) : null}
    </div>
  )
}
