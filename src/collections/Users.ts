import type { CollectionConfig } from 'payload'
import { ROLES, adminFieldOnly, adminsOnly, loggedIn } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
  },
  auth: true,
  access: {
    read: loggedIn,
    create: adminsOnly,
    delete: adminsOnly,
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      options: [...ROLES],
      defaultValue: 'editor',
      required: true,
      saveToJWT: true,
      access: { update: adminFieldOnly, create: adminFieldOnly },
      admin: { description: 'Editors save drafts. Reviewers and admins can publish.' },
    },
  ],
}
