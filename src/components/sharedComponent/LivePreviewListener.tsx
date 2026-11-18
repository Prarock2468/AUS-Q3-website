'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** In preview mode, refresh the page whenever the editor saves in the CMS. */
export function LivePreviewListener() {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={typeof window !== 'undefined' ? window.location.origin : ''}
    />
  )
}
