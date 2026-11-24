/**
 * Checks the email setup in .env: logs in to the SMTP server and sends one test email to LEADS_NOTIFY_TO.
 * `npm run test:email`
 */
import 'dotenv/config'
import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, LEADS_NOTIFY_TO } = process.env
const missing = Object.entries({ SMTP_HOST, SMTP_USER, SMTP_PASS, LEADS_NOTIFY_TO }).filter(([, v]) => !v).map(([k]) => k)
if (missing.length) {
  console.error(`✗ Missing in .env: ${missing.join(', ')}`)
  process.exit(1)
}
if (SMTP_PASS === 'yahan-16-letter-ka-code' || SMTP_PASS!.replace(/\s/g, '').length !== 16) {
  console.warn('! SMTP_PASS does not look like a Gmail App Password (16 letters). Trying anyway…')
}

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: SMTP_PORT === '465',
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

try {
  await transport.verify()
  console.log(`✓ Logged in to ${SMTP_HOST} as ${SMTP_USER}`)
  const info = await transport.sendMail({
    from: `"Q3 Technologies Australia" <${EMAIL_FROM || SMTP_USER}>`,
    to: LEADS_NOTIFY_TO,
    subject: 'Test email from the Q3 website',
    text: 'If you can read this, the website can send email. Forms will now send enquiry and confirmation emails.',
  })
  console.log(`✓ Test email sent to ${LEADS_NOTIFY_TO} (id ${info.messageId}). Check the inbox, and the Spam folder.`)
} catch (err) {
  const e = err as { code?: string; responseCode?: number; message?: string }
  console.error(`✗ Could not send: ${e.message}`)
  if (e.code === 'EAUTH' || e.responseCode === 535) {
    console.error('  → Gmail rejected the login. Put a Google App Password in SMTP_PASS (https://myaccount.google.com/apppasswords),')
    console.error('    16 letters without spaces. 2-Step Verification must be on for the account.')
  }
  process.exit(1)
}
