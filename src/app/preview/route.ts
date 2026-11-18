import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/data'

/** /preview?path=/about — shows drafts to logged-in CMS users. /preview?exit=1 turns it off. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'
  const safePath = path.startsWith('/') && !path.startsWith('//') ? path : '/'
  const dm = await draftMode()

  if (url.searchParams.get('exit')) {
    dm.disable()
    redirect(safePath)
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return new Response('Log in to the CMS to preview drafts.', { status: 403 })

  dm.enable()
  redirect(safePath)
}
