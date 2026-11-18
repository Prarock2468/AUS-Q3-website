import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: { group: 'Content', useAsTitle: 'name', defaultColumns: ['name', 'role'] },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: { afterChange: [revalidateOnChange], afterDelete: [revalidateOnDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', label: 'Job title', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    { name: 'linkedin', label: 'LinkedIn URL', type: 'text' },
  ],
}
