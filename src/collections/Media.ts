import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: {
    read: anyone,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: { description: 'Describe the image for screen readers and search engines. Leave empty for decorative images.' },
    },
  ],
  upload: {
    // Local disk in development. In production, set S3_BUCKET and the S3 storage adapter takes over.
    staticDir: path.resolve(dirname, '../../media'),
    // No SVG: an uploaded SVG can carry script and is served from this domain. Site icons live in /public/assets.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf'],
    focalPoint: true,
    imageSizes: [
      // 800px version used in responsive srcsets (matches the old hero-800.webp files)
      { name: 'w800', width: 800, formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
    adminThumbnail: 'w800',
  },
}
