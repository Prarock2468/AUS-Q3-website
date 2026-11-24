import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'

/**
 * "Form" section: shows a form built in Leads → Forms (its fields, button, thank-you message and email settings),
 * in the Contact Us card design. Straight after a "Contact info" section the two show side by side; on its own it
 * takes the full width with the optional heading above the fields.
 * Rendered by src/components/sections/ContactForms.tsx; submitted by /js/enquiry-form.js to /forms/enquiry, which checks every
 * value against the form's fields again on the server.
 */
export const FormSectionBlock: Block = {
  slug: 'formSection',
  interfaceName: 'FormSectionBlock',
  labels: { singular: 'Form', plural: 'Forms' },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: { description: 'Build and edit forms in Leads → Forms.' },
    },
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
    { name: 'anchorId', type: 'text', admin: { description: 'Optional id, for example "enquiry", so links can jump here.' } },
  ],
}
