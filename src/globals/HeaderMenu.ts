import type { Field, FieldHook, GlobalConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

/** Collections a menu link can point at, like WordPress's "Pages" and "Posts" boxes. */
export const MENU_LINK_COLLECTIONS = ['pages', 'case-studies', 'insights'] as const

type Ref = { relationTo: (typeof MENU_LINK_COLLECTIONS)[number]; value: number | string | { id: number | string } }

/** An empty label on a "Page or post" link is filled with that page's or post's title when saving. */
const defaultLabelFromReference: FieldHook = async ({ value, siblingData, req }) => {
  if ((typeof value === 'string' && value.trim()) || siblingData?.type !== 'reference') return value
  const ref = siblingData?.reference as Ref | undefined
  if (!ref?.value) return value
  const id = typeof ref.value === 'object' ? ref.value.id : ref.value
  try {
    const doc = (await req.payload.findByID({ collection: ref.relationTo, id, depth: 0, draft: true, req })) as {
      title?: string
      cardTitle?: string
    }
    return (doc.cardTitle || doc.title || '').replace(/\s+/g, ' ').trim() || value
  } catch {
    return value
  }
}

/** Link fields shared by menu items and submenu items. */
const linkFields = (opts: { linkDescription: string }): Field[] => [
  {
    name: 'type',
    label: 'Link to',
    type: 'radio',
    defaultValue: 'reference',
    options: [
      { label: 'Page or post', value: 'reference' },
      { label: 'Custom link', value: 'custom' },
    ],
    admin: { layout: 'horizontal' },
  },
  {
    name: 'reference',
    label: 'Page or post',
    type: 'relationship',
    relationTo: [...MENU_LINK_COLLECTIONS],
    admin: {
      condition: (_, s) => s?.type !== 'custom',
      description: 'Pick a page, case study or insight. Its address is used, and stays right if the address changes.',
    },
    validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
      siblingData?.type === 'custom' || value ? true : 'Pick a page or post, or choose "Custom link".',
  },
  {
    type: 'row',
    fields: [
      {
        name: 'label',
        type: 'text',
        admin: {
          width: '50%',
          description: 'Text shown in the menu. Leave empty to use the page or post title.',
        },
        hooks: { beforeChange: [defaultLabelFromReference] },
        validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
          siblingData?.type !== 'custom' || (typeof value === 'string' && value.trim()) ? true : 'Add a label for a custom link.',
      },
      {
        name: 'link',
        label: 'URL',
        type: 'text',
        admin: {
          width: '50%',
          condition: (_, s) => s?.type === 'custom',
          description: opts.linkDescription,
        },
      },
    ],
  },
  { name: 'newTab', label: 'Open in a new tab', type: 'checkbox', defaultValue: false },
]

/**
 * The main menu in the site header (desktop dropdowns and the mobile menu). The logo, search button and
 * "Contact us" button are part of the header component.
 */
export const HeaderMenu: GlobalConfig = {
  slug: 'header-menu',
  label: 'Menu and submenus',
  admin: {
    group: 'Header Menu',
    description:
      'Top-level menu items in order; drag to reorder. Add submenu items to turn an item into a dropdown. Each link points at a page or post, or a custom URL.',
  },
  access: { read: anyone, update: loggedIn },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'items',
      label: 'Menu items',
      type: 'array',
      labels: { singular: 'Menu item', plural: 'Menu items' },
      admin: { initCollapsed: true, components: { RowLabel: './globals/HeaderMenuRowLabel#HeaderMenuRowLabel' } },
      fields: [
        ...linkFields({
          linkDescription:
            'For example /about or https://example.com. For a dropdown, also the heading link in the mobile menu; leave empty to use the first submenu link.',
        }),
        {
          name: 'submenuStyle',
          label: 'Dropdown width',
          type: 'select',
          defaultValue: 'wide',
          options: [
            { label: 'Wide', value: 'wide' },
            { label: 'Compact', value: 'compact' },
          ],
          admin: { condition: (_, item) => Boolean(item?.submenu?.length) },
        },
        {
          name: 'submenu',
          label: 'Submenu',
          type: 'array',
          labels: { singular: 'Submenu item', plural: 'Submenu items' },
          admin: {
            initCollapsed: true,
            description: 'Leave empty for a plain link.',
            components: { RowLabel: './globals/HeaderMenuRowLabel#HeaderMenuRowLabel' },
          },
          fields: linkFields({ linkDescription: 'For example /services/managed-it-services. Leave empty to show plain text.' }),
        },
      ],
    },
  ],
}
