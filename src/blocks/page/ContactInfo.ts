import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'
import { textToRichText } from '../../fields/richTextValue'

/** Icons offered beside a phone number (files in /public/assets/icons, or a drawn icon). */
export const PHONE_ICONS = [
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Flag: India', value: 'in' },
  { label: 'Flag: USA', value: 'us' },
  { label: 'Flag: Australia', value: 'au' },
  { label: 'Phone', value: 'phone' },
  { label: 'None', value: 'none' },
] as const

/**
 * "Contact info" section: the dark panel of the Contact Us design (heading, intro, email, phone numbers, "What
 * happens next" steps). Put an "Enquiry form" section straight after it to show the two side by side; on its own it
 * takes the full width. Rendered by src/components/sections/ContactForms.tsx.
 */
export const ContactInfoBlock: Block = {
  slug: 'contactInfo',
  interfaceName: 'ContactInfoBlock',
  labels: { singular: 'Contact info', plural: 'Contact info' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'heading', type: 'text', required: true, defaultValue: 'Contact Us', admin: { width: '60%' } },
        {
          name: 'isPageHeading',
          label: 'Main heading of the page (h1)',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '40%', description: 'Tick when this section is the top of the page, like on Contact Us.' },
        },
      ],
    },
    { name: 'showBreadcrumb', label: 'Show breadcrumb (Home › heading)', type: 'checkbox', defaultValue: false },
    inlineText('text', {
      label: 'Intro',
      defaultValue: textToRichText("Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we'll be in touch soon.") ?? undefined,
    }),
    {
      type: 'row',
      fields: [
        { name: 'emailLabel', label: 'Email: label', type: 'text', defaultValue: 'Email', admin: { width: '30%' } },
        {
          name: 'email',
          label: 'Email: address',
          type: 'text',
          defaultValue: 'sales@q3tech.com',
          admin: { width: '70%', description: 'Leave empty to hide the email row.' },
        },
      ],
    },
    { name: 'phonesLabel', label: 'Phone numbers: label', type: 'text', defaultValue: 'Call Us' },
    {
      name: 'phones',
      label: 'Phone numbers',
      type: 'array',
      labels: { singular: 'Phone number', plural: 'Phone numbers' },
      admin: { description: 'Leave empty to hide the phone row.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'number', type: 'text', required: true, admin: { width: '60%', placeholder: '+61 405 642 510' } },
            { name: 'icon', type: 'select', defaultValue: 'phone', options: [...PHONE_ICONS], admin: { width: '40%' } },
          ],
        },
      ],
    },
    { name: 'nextHeading', label: '"What happens next": heading', type: 'text', defaultValue: 'What Happens Next?' },
    {
      name: 'nextSteps',
      label: '"What happens next": steps',
      type: 'array',
      labels: { singular: 'Step', plural: 'Steps' },
      admin: { description: 'Each step gets a tick. Leave empty to hide this box.' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'anchorId',
      type: 'text',
      admin: { description: 'Optional id, for example "contact", so links can jump here.' },
    },
  ],
}
