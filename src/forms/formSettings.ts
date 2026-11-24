import type { Field } from 'payload'

/** Default heading of the thank-you box (same as the other website forms, src/components/ui/ThankYouBox.tsx). */
const THANKS_HEADING = 'Thanks, we’ve received your enquiry'

/**
 * Settings added to every form in Leads → Forms (formOverrides.fields of the form builder plugin): who receives the
 * enquiries, the thank-you email, and the consent, captcha, note and thank-you heading of the website form.
 * The plugin's own "Emails" list is hidden: the website sends its emails itself (Site settings → Email), so emails
 * set there would arrive twice.
 */
export function formSettingsFields({ defaultFields }: { defaultFields: Field[] }): Field[] {
  const fields = defaultFields.map((f) =>
    'name' in f && f.name === 'emails' ? ({ ...f, admin: { ...(f.admin || {}), hidden: true } } as Field) : f,
  )
  return [
    ...fields,
    {
      type: 'collapsible',
      label: 'Website form settings',
      admin: {
        initCollapsed: false,
        description: 'Used when this form is placed on a page with the "Form" section.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'notifyTo',
              label: 'Send enquiries to',
              type: 'text',
              admin: {
                width: '60%',
                description: 'Separate several addresses with commas. Empty: Site settings → Email → "Send enquiries to".',
              },
            },
            {
              name: 'autoReply',
              label: 'Send a thank-you email (to the first Email field)',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '40%' },
            },
          ],
        },
        {
          name: 'thanksHeading',
          label: 'Thank-you heading (on the page)',
          type: 'text',
          defaultValue: THANKS_HEADING,
          admin: { description: 'The message under it is the "Confirmation Message" above.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'showConsent',
              label: 'Ask to agree to the Privacy Policy',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '50%' },
            },
            {
              name: 'privacyUrl',
              label: 'Privacy Policy link',
              type: 'text',
              defaultValue: 'https://www.q3tech.com/privacy-policy/',
              admin: { width: '50%', condition: (_, s) => s?.showConsent !== false },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'showCaptcha', label: 'Security question (e.g. 7 + 8)', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
            {
              name: 'secureNote',
              label: 'Note under the button',
              type: 'text',
              defaultValue: 'Your information is secure and never shared with third parties.',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ]
}
