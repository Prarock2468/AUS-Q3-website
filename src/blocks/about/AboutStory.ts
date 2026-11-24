import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'

/**
 * "Our story (timeline)" on the About page ("Championing Quality, Shaping Tomorrow"): milestone cards that scroll
 * sideways, with a row of year buttons under them. Rendered by src/components/sections/AboutSections.tsx (AboutStory); the scrolling
 * and year buttons come from /js/templates/about.min.js.
 */
export const AboutStoryBlock: Block = {
  slug: 'aboutStory',
  interfaceName: 'AboutStoryBlock',
  labels: { singular: 'Our story (timeline)', plural: 'Our story (timeline)' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Small text above the heading', type: 'text', defaultValue: 'Our Story', admin: { width: '40%' } },
        { name: 'heading', type: 'text', required: true, defaultValue: 'Championing Quality, Shaping Tomorrow', admin: { width: '60%' } },
      ],
    },
    {
      name: 'milestones',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Milestone', plural: 'Milestones' },
      admin: {
        initCollapsed: true,
        description: 'Shown in this order, left to right. Each year also becomes a button under the cards.',
        components: { RowLabel: './fields/AboutStoryRowLabel#AboutStoryRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'year', type: 'text', required: true, admin: { width: '25%', description: 'e.g. 1996' } },
            { name: 'title', type: 'text', required: true, admin: { width: '75%' } },
          ],
        },
        inlineText('description', { required: true }),
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Landscape, about 1000 × 666 (WebP or JPG).' },
        },
      ],
    },
  ],
}
