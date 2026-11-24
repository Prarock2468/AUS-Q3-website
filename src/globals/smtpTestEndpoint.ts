import type { Endpoint } from 'payload'
import { isAdmin } from '../access'
import { adminSmtp, loadEmailSettings, sendTestEmail } from '../lib/mailer'

/**
 * POST /api/globals/site-settings/test-email (the "Send test email" button in Site settings → Email): logs in to the
 * saved mail server and sends a test email to the admin who pressed it. Admins only.
 */
export const smtpTestEndpoint: Endpoint = {
  path: '/test-email',
  method: 'post',
  handler: async (req) => {
    const user = req.user as { role?: string; email?: string } | null
    if (!isAdmin(user)) return Response.json({ ok: false, message: 'Only admins can send a test email.' }, { status: 403 })
    const smtp = adminSmtp(await loadEmailSettings(req.payload))
    if (!smtp) {
      return Response.json(
        { ok: false, message: 'Fill in SMTP host, username and password, click Save, then send the test.' },
        { status: 400 },
      )
    }
    const to = user?.email || smtp.from
    try {
      await sendTestEmail(smtp, to)
      return Response.json({ ok: true, message: `Test email sent to ${to}. Check the inbox (and Spam).` })
    } catch (err) {
      const e = err as { code?: string; responseCode?: number; message?: string }
      const hint =
        e.code === 'EAUTH' || e.responseCode === 535
          ? ' The username or password was not accepted. For Gmail, use an App Password (16 letters).'
          : ''
      return Response.json({ ok: false, message: `Could not send: ${e.message || 'unknown error'}.${hint}` }, { status: 502 })
    }
  },
}
