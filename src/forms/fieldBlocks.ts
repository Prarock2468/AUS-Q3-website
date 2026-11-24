import { fields as builtIn } from '@payloadcms/plugin-form-builder'
import type { Block, Field } from 'payload'

/**
 * Field types offered in Leads → Forms → Add Field, for forms shown on the website with the "Form" page section.
 * The plugin's own types get a placeholder and an error message; Phone and File upload are added here.
 * Rendered by src/components/sections/ContactForms.tsx, checked again on the server in src/app/forms/enquiry/route.ts.
 */

const placeholder: Field = { name: 'placeholder', type: 'text', admin: { width: '50%' } }
const errorMessage: Field = {
  name: 'errorMessage',
  label: 'Error message',
  type: 'text',
  admin: {
    width: '50%',
    description: 'Shown when this field is left empty or filled in wrongly. Empty: a standard message.',
  },
}
const extras = (withPlaceholder: boolean): Field => ({
  type: 'row',
  fields: withPlaceholder ? [placeholder, errorMessage] : [{ ...errorMessage, admin: { ...errorMessage.admin, width: '100%' } }],
})

/** A built-in field type (the plugin types some as factories) with the extra options appended. */
const extend = (source: Block | ((arg?: unknown) => Block), withPlaceholder: boolean): Block => {
  const block = typeof source === 'function' ? source() : source
  return { ...block, fields: [...block.fields, extras(withPlaceholder)] }
}

const nameLabel: Field = {
  type: 'row',
  fields: [
    { name: 'name', type: 'text', required: true, admin: { width: '50%', description: 'Short id, no spaces, e.g. phone.' } },
    { name: 'label', type: 'text', admin: { width: '50%' } },
  ],
}
const widthRequired: Field = {
  type: 'row',
  fields: [
    { name: 'width', type: 'number', admin: { width: '50%', description: 'Percent of the row: 100, or 50 to put two fields side by side.' } },
    { name: 'required', type: 'checkbox', admin: { width: '50%' } },
  ],
}

/** Accepted by File upload fields unless a field sets its own list (kept under Vercel's 4.5 MB request limit). */
export const DEFAULT_FILE_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp,.zip'
export const MAX_FILE_MB = 4

export const PhoneBlock: Block = {
  slug: 'phone',
  labels: { singular: 'Phone', plural: 'Phone fields' },
  fields: [nameLabel, widthRequired, extras(true)],
}

export const FileBlock: Block = {
  slug: 'file',
  labels: { singular: 'File upload', plural: 'File uploads' },
  fields: [
    nameLabel,
    widthRequired,
    {
      type: 'row',
      fields: [
        {
          name: 'accept',
          label: 'Allowed file types',
          type: 'text',
          defaultValue: DEFAULT_FILE_TYPES,
          admin: { width: '70%', description: 'Comma-separated, e.g. .pdf,.docx' },
        },
        {
          name: 'maxSizeMb',
          label: 'Max size (MB)',
          type: 'number',
          defaultValue: MAX_FILE_MB,
          min: 1,
          max: MAX_FILE_MB,
          admin: { width: '30%' },
        },
      ],
    },
    extras(false),
  ],
}

/** The `fields` option of the form builder plugin: which field types are offered, in this order. */
export const formFieldTypes = {
  text: extend(builtIn.text, true),
  email: extend(builtIn.email, true),
  phone: PhoneBlock,
  number: extend(builtIn.number, true),
  textarea: extend(builtIn.textarea, true),
  select: extend(builtIn.select, false),
  checkbox: extend(builtIn.checkbox, false),
  date: extend(builtIn.date, false),
  file: FileBlock,
  message: true, // the plugin's own: a rich-text note shown between fields
  // Not offered: payment; the plugin's upload (stores files publicly in Media; File upload emails them instead);
  // radio, country and state (not drawn by the website form yet).
  payment: false,
  upload: false,
  radio: false,
  country: false,
  state: false,
} as const
