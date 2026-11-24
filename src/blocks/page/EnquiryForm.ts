import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'

/**
 * "Enquiry form" section: the form card of the Contact Us design (name, email, company, phone, file, message,
 * consent, captcha). Straight after a "Contact info" section the two show side by side; on its own it takes the full
 * width, with the optional heading above the fields. On submit the enquiry is saved (Leads → Form Submissions),
 * emailed with the file attached, and the visitor gets a confirmation email (Site settings → Email).
 * Rendered by src/components/sections/ContactForms.tsx; submitted by /js/enquiry-form.js to /forms/enquiry.
 */
export const EnquiryFormBlock: Block = {
  slug: 'enquiryForm',
  interfaceName: 'EnquiryFormBlock',
  labels: { singular: 'Enquiry form (with file upload)', plural: 'Enquiry forms (with file upload)' },
  fields: [
    {
      name: 'heading',
      label: 'Heading above the form',
      type: 'text',
      admin: { description: 'Optional. Only shown when the form is not next to a Contact info section.' },
    },
    inlineText('text', {
      label: 'Text under the heading',
      admin: { description: 'Optional. Only shown when the form is not next to a Contact info section.' },
    }),
    {
      type: 'row',
      fields: [
        { name: 'submitLabel', label: 'Button text', type: 'text', defaultValue: 'Submit', admin: { width: '40%' } },
        {
          name: 'privacyUrl',
          label: 'Privacy Policy link',
          type: 'text',
          defaultValue: 'https://www.q3tech.com/privacy-policy/',
          admin: { width: '60%' },
        },
      ],
    },
    {
      name: 'secureNote',
      label: 'Note under the button',
      type: 'text',
      defaultValue: 'Your information is secure and never shared with third parties.',
    },
    { name: 'thanksHeading', label: 'After sending: heading', type: 'text', defaultValue: 'Thanks, we’ve received your enquiry' },
    {
      name: 'thanksText',
      label: 'After sending: message',
      type: 'text',
      defaultValue: 'Our team will get back to you as soon as possible.',
    },
    {
      name: 'anchorId',
      type: 'text',
      admin: { description: 'Optional id, for example "enquiry", so links can jump here.' },
    },
  ],
}
