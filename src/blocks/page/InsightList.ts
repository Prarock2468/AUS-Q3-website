import type { Block } from 'payload'

/** Paged grid of every insight. */
export const InsightList: Block = {
  slug: 'insightList',
  labels: { singular: 'All insights grid', plural: 'All insights grids' },
  fields: [{ name: 'pageSize', type: 'number', defaultValue: 12 }],
}
