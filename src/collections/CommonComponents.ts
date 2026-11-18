import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { baseBlocks, commonComponentEntryBlocks } from '../blocks'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate'

/** Reusable content (banners, CTAs, FAQ groups…) edited once and shared across pages. */
export const CommonComponents: CollectionConfig = {
  slug: 'commonComponent',
  labels: { singular: 'Common component', plural: 'Common components' },
  admin: {
    group: 'Common Component',
    useAsTitle: 'title',
    defaultColumns: ['title', 'key', 'updatedAt'],
    description: 'Reusable sections that can be shared across pages. Edit once, update everywhere.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: { afterChange: [revalidateOnChange], afterDelete: [revalidateOnDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'Name shown in the CMS.' } },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Unique identifier used in code to look up this component, for example "footer-cta".' },
    },
    {
      name: 'layout',
      label: 'Sections',
      type: 'blocks',
      labels: { singular: 'Section', plural: 'Sections' },
      blocks: [...commonComponentEntryBlocks, ...baseBlocks],
      admin: { initCollapsed: true },
    },
  ],
}
