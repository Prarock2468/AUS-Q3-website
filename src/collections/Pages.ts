import type { CollectionConfig } from 'payload'
import { loggedIn, publishGate, publishedOrLoggedIn } from '../access'
import { pageBlocks, pageBlocksFilter } from '../blocks'
import { seoExtras } from '../fields/common'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate'
import { PAGE_TEMPLATE_OPTIONS } from '../templates'
import { templateStarterEndpoint } from './templateStarter'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'template', '_status', 'updatedAt'],
    description: 'Every page that is not a case study or an insight: home, services, industries, about, contact and lists.',
    livePreview: { url: ({ data }) => `/preview?path=${data?.path ?? '/'}` },
    preview: (doc) => `/preview?path=${doc?.path ?? '/'}`,
  },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 50 },
  hooks: {
    beforeChange: [publishGate],
    afterChange: [revalidateOnChange],
    afterDelete: [revalidateOnDelete],
  },
  defaultSort: 'path',
  endpoints: [templateStarterEndpoint],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { description: 'Name of the page in the CMS and in site search.' } },
            {
              name: 'layout',
              label: 'Page sections',
              type: 'blocks',
              labels: { singular: 'Section', plural: 'Sections' },
              blocks: pageBlocks,
              // Home-only sections (for example "Our services (home page)") are offered only when Template is Home.
              filterOptions: pageBlocksFilter,
              admin: { initCollapsed: true, description: 'Sections render top to bottom. Drag to reorder.' },
            },
          ],
        },
        {
          label: 'Site search',
          fields: [
            { name: 'searchSection', type: 'text', admin: { description: 'Group label in site search, for example "Services".' } },
            { name: 'searchDescription', type: 'textarea', admin: { description: 'Leave empty to use the meta description.' } },
            { name: 'hideFromSearch', type: 'checkbox' },
          ],
        },
        { label: 'Advanced SEO', fields: [seoExtras] },
      ],
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Full URL path, for example "/about" or "/services/managed-it-services". The home page is "/".',
      },
      validate: (value: unknown) =>
        typeof value === 'string' && /^\/([a-z0-9]+(?:-[a-z0-9]+)*(\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/.test(value)
          ? true
          : 'Start with "/" and use lowercase letters, numbers, hyphens and "/" only.',
    },
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: 'main',
      options: PAGE_TEMPLATE_OPTIONS,
      admin: {
        position: 'sidebar',
        description:
          'Controls which stylesheet and scripts the page loads. Choosing a template fills Page sections with that template’s default sections.',
        components: { Field: './fields/TemplatePicker#TemplatePicker' },
      },
    },
    {
      name: 'isTemplateStarter',
      label: 'Starter for new pages',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'New pages that choose this template start with a copy of this page’s sections. Tick it on one page per template; otherwise the oldest published page is used.',
      },
    },
    { name: 'bodyClass', type: 'text', admin: { position: 'sidebar' } },
    { name: 'mainClass', type: 'text', admin: { position: 'sidebar' } },
  ],
}
