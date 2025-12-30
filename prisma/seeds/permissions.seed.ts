import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PermissionData {
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

const permissions: PermissionData[] = [
  // User Management Permissions
  { code: 'user.list', name: 'List Users', description: 'View list of users', resource: 'user', action: 'list' },
  { code: 'user.read', name: 'Read User', description: 'View user details', resource: 'user', action: 'read' },
  { code: 'user.create', name: 'Create User', description: 'Create new user', resource: 'user', action: 'create' },
  { code: 'user.update', name: 'Update User', description: 'Update user details', resource: 'user', action: 'update' },
  { code: 'user.delete', name: 'Delete User', description: 'Delete user', resource: 'user', action: 'delete' },
  { code: 'user.profile', name: 'View Profile', description: 'View own profile', resource: 'user', action: 'profile' },

  // Post Management Permissions
  { code: 'post.list', name: 'List Posts', description: 'View list of posts', resource: 'post', action: 'list' },
  { code: 'post.read', name: 'Read Post', description: 'View post details', resource: 'post', action: 'read' },
  { code: 'post.create', name: 'Create Post', description: 'Create new post', resource: 'post', action: 'create' },
  { code: 'post.update', name: 'Update Post', description: 'Update post', resource: 'post', action: 'update' },
  { code: 'post.delete', name: 'Delete Post', description: 'Delete post', resource: 'post', action: 'delete' },

  // Audit Log Permissions
  { code: 'audit.list', name: 'List Audit Logs', description: 'View all audit logs', resource: 'audit', action: 'list' },
  { code: 'audit.read', name: 'Read Audit Log', description: 'View audit log details', resource: 'audit', action: 'read' },
  { code: 'audit.me', name: 'View My Logs', description: 'View own audit logs', resource: 'audit', action: 'me' },

  // File Management Permissions
  { code: 'file.list', name: 'List Files', description: 'View list of files', resource: 'file', action: 'list' },
  { code: 'file.read', name: 'Read File', description: 'View file details', resource: 'file', action: 'read' },
  { code: 'file.create', name: 'Upload File', description: 'Upload new file', resource: 'file', action: 'create' },
  { code: 'file.delete', name: 'Delete File', description: 'Delete file', resource: 'file', action: 'delete' },

  // Email Management Permissions
  { code: 'email.send', name: 'Send Email', description: 'Send custom or templated email', resource: 'email', action: 'send' },
  { code: 'email.view', name: 'View Email Config', description: 'View email provider configuration', resource: 'email', action: 'view' },
];

async function seedPermissions() {
  console.log('🌱 Seeding permissions...');

  // Create permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: permission,
      create: permission,
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Admin gets ALL permissions
  console.log('🔐 Assigning permissions to ADMIN role...');
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: 'ADMIN',
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: 'ADMIN',
        permissionId: permission.id,
      },
    });
  }

  // User gets limited permissions
  console.log('🔐 Assigning permissions to USER role...');
  const userPermissionCodes = [
    'user.profile',
    'post.list',
    'post.read',
    'post.create',
    'post.update', // own posts only
    'post.delete', // own posts only
    'audit.me',
    'file.list',
    'file.read',
    'file.create',
    'file.delete', // own files only
  ];

  for (const code of userPermissionCodes) {
    const permission = allPermissions.find((p) => p.code === code);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: 'USER',
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          role: 'USER',
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Permissions assigned successfully');
}

export { seedPermissions };
