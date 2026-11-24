'use client'
import { Button, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

/**
 * "Send test email" in Site settings → Email → Mail server: sends a test with the SAVED settings to the logged-in
 * admin and shows the result. (Unsaved changes must be saved first.)
 */
export function SmtpTestButton() {
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const { isDirty } = useDocumentInfo() as { isDirty?: boolean }
  const [state, setState] = useState<{ busy: boolean; ok?: boolean; message?: string }>({ busy: false })

  const send = async () => {
    setState({ busy: true })
    try {
      const res = await fetch(`${serverURL}${api}/globals/site-settings/test-email`, { method: 'POST', credentials: 'include' })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }
      setState({ busy: false, ok: Boolean(json.ok), message: json.message || `HTTP ${res.status}` })
    } catch (err) {
      setState({ busy: false, ok: false, message: (err as Error).message })
    }
  }

  return (
    <div style={{ margin: '4px 0 24px' }}>
      <Button buttonStyle="secondary" size="small" disabled={state.busy} onClick={send}>
        {state.busy ? 'Sending…' : 'Send test email'}
      </Button>
      <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.75 }}>
        Uses the saved settings{isDirty ? ': save your changes first' : ''}. The test goes to your admin email address.
      </p>
      {state.message ? (
        <p role="status" style={{ margin: '8px 0 0', fontSize: 14, color: state.ok ? '#15803d' : '#b91c1c' }}>
          {state.ok ? '✓ ' : '✗ '}
          {state.message}
        </p>
      ) : null}
    </div>
  )
}
