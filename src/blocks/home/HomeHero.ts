import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'
import { buttonsField } from './fields'

/**
 * Home page hero: badges, the page heading (h1), intro, buttons, and the background video with its poster image.
 * Rendered by components/homeComponent/HomeHero.tsx. Buttons use the shared field in ./fields.ts.
 */
export const HomeHeroBlock: Block = {
  slug: 'homeHero',
  interfaceName: 'HomeHeroBlock',
  labels: { singular: 'Hero (home page)', plural: 'Heroes (home page)' },
  fields: [
    {
      name: 'badges',
      type: 'array',
      labels: { singular: 'Badge', plural: 'Badges' },
      admin: { description: 'Small pills above the heading, for example "☁️ Salesforce Certified Partner".' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'icon', type: 'text', admin: { width: '15%', description: 'An emoji.' } },
            { name: 'highlight', label: 'Bold text', type: 'text', required: true, admin: { width: '35%', description: 'e.g. Salesforce' } },
            { name: 'text', type: 'text', admin: { width: '50%', description: 'e.g. Certified Partner' } },
          ],
        },
      ],
    },
    { name: 'heading', type: 'text', required: true, admin: { description: 'The page’s main heading (h1).' } },
    inlineText('intro'),
    buttonsField(),
    {
      type: 'collapsible',
      label: 'Background',
      fields: [
        {
          name: 'poster',
          label: 'Poster image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Shown straight away, and instead of the video for visitors who prefer reduced motion or save data. Loaded first.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'videoWebm',
              label: 'Video (WebM)',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { equals: 'video/webm' } },
              admin: { width: '50%', description: 'Smaller file, used by most browsers.' },
            },
            {
              name: 'videoMp4',
              label: 'Video (MP4)',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { equals: 'video/mp4' } },
              admin: { width: '50%', description: 'Fallback for Safari. Leave both empty for the poster only.' },
            },
          ],
        },
      ],
    },
  ],
}
