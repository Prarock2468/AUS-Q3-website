import { APIError, type Access, type CollectionBeforeChangeHook, type FieldAccess } from 'payload'

/** Roles used across the CMS. */
export const ROLES = [
  { label: 'Admin', value: 'admin' },
  { label: 'Reviewer (can publish)', value: 'reviewer' },
  { label: 'Editor (drafts only)', value: 'editor' },
] as const

type RoleUser = { role?: string | null } | null | undefined

export const isAdmin = (user: RoleUser) => user?.role === 'admin'
export const canPublish = (user: RoleUser) => user?.role === 'admin' || user?.role === 'reviewer'

export const anyone: Access = () => true
export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const adminsOnly: Access = ({ req }) => isAdmin(req.user as RoleUser)
export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin(req.user as RoleUser)

/**
 * Public visitors only see published documents; logged-in users see drafts too.
 */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

/**
 * Approval workflow: editors can create and save drafts, but only reviewers and admins can publish.
 * Seed scripts and other server code run without a user and are allowed through.
 */
export const publishGate: CollectionBeforeChangeHook = ({ data, req }) => {
  const user = req.user as RoleUser
  if (user && data?._status === 'published' && !canPublish(user)) {
    throw new APIError('Editors can save drafts. Ask a reviewer or admin to publish this change.', 403, null, true)
  }
  return data
}
