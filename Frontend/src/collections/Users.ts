import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isOrganisationalHead = ({ req }: Parameters<Access>[0]) =>
  req.user?.collection === 'users' && req.user.role === 'organisational-head'

const readOwnProfile: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false
  if (req.user.role === 'organisational-head') return true
  return { id: { equals: req.user.id } }
}

const manageRole: FieldAccess = ({ req }) =>
  req.user?.collection === 'users' && req.user.role === 'organisational-head'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    create: () => true,
    delete: isOrganisationalHead,
    read: readOwnProfile,
    update: readOwnProfile,
  },
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'viewer',
      required: true,
      access: {
        create: manageRole,
        update: manageRole,
      },
      options: [
        { label: 'Viewer', value: 'viewer' },
        { label: 'Admin', value: 'admin' },
        { label: 'Organisational Head', value: 'organisational-head' },
      ],
    },
    {
      name: 'department',
      type: 'text',
      maxLength: 80,
    },
  ],
  versions: false,
}
