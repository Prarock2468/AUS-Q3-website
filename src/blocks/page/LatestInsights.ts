import type { Block } from 'payload'

/** Slider of picked (or the latest) insights. */
export const LatestInsights: Block = {
  slug: 'latestInsights',
  labels: { singular: 'Latest insights slider', plural: 'Latest insights sliders' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Insights' },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'insights',
      hasMany: true,
      admin: { description: 'Pick the articles to show, in order. Leave empty to show the latest ones.' },
    },
    { name: 'limit', type: 'number', defaultValue: 5, admin: { condition: (_, s) => !s?.posts?.length } },
  ],
}
