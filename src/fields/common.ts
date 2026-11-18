import type { Field } from 'payload'

/** URL-safe slug, unique per collection. */
export const slugField = (description = 'Last part of the URL, for example "ai-in-healthcare".'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description },
  validate: (value: unknown) =>
    typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
      ? true
      : 'Use lowercase letters, numbers and hyphens only.',
})

/** Extra SEO controls that sit next to the SEO plugin's title, description and image fields. */
export const seoExtras: Field = {
  name: 'seoExtras',
  label: 'Advanced SEO',
  type: 'group',
  fields: [
    {
      name: 'canonical',
      type: 'text',
      admin: { description: 'Leave empty to use this page’s own URL.' },
    },
    { name: 'noindex', type: 'checkbox', label: 'Hide from search engines (noindex)' },
    {
      name: 'globalUrl',
      label: 'Matching page on the global site (hreflang)',
      type: 'text',
      admin: {
        description: 'If this page has an equivalent on www.q3tech.com, add its URL. It is linked as the "en" and x-default alternate.',
      },
    },
    {
      name: 'structuredData',
      label: 'Extra JSON-LD (advanced)',
      type: 'json',
      admin: {
        description:
          'Optional schema.org JSON added to the page. Organization, breadcrumbs, articles and FAQs are generated automatically.',
      },
    },
  ],
}

export const sortOrderField: Field = {
  name: 'sortOrder',
  type: 'number',
  defaultValue: 100,
  admin: { position: 'sidebar', description: 'Lower numbers appear first in lists.' },
}
