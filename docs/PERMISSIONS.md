# Permission-Based Access Control (PBAC)

## Overview
Sistem permission-based access control yang **dinamis** dan **tidak hardcode role** di routes. Setiap user role memiliki permissions yang dapat dikonfigurasi melalui database.

## Konsep

### 1. **Permission** (Izin)
- Merepresentasikan aksi tertentu pada resource tertentu
- Format code: `{resource}.{action}`
- Contoh: `user.create`, `post.delete`, `audit.list`

### 2. **Role** (Peran)
- ADMIN dan USER (dapat ditambah)
- Setiap role memiliki banyak permissions

### 3. **Dynamic Authorization**
- Routes TIDAK hardcode role (`authorize('ADMIN')` ❌)
- Routes check permission (`verifyToken('user.create')` ✅)
- Fleksibel: permissions dapat diubah tanpa mengubah code

## Permission List

### User Management
| Code | Name | Description | ADMIN | USER |
|------|------|-------------|-------|------|
| `user.list` | List Users | View list of users | ✅ | ❌ |
| `user.read` | Read User | View user details | ✅ | ❌ |
| `user.create` | Create User | Create new user | ✅ | ❌ |
| `user.update` | Update User | Update user details | ✅ | ❌ |
| `user.delete` | Delete User | Delete user | ✅ | ❌ |
| `user.profile` | View Profile | View own profile | ✅ | ✅ |

### Post Management
| Code | Name | Description | ADMIN | USER |
|------|------|-------------|-------|------|
| `post.list` | List Posts | View list of posts | ✅ | ✅ |
| `post.read` | Read Post | View post details | ✅ | ✅ |
| `post.create` | Create Post | Create new post | ✅ | ✅ |
| `post.update` | Update Post | Update post | ✅ | ✅ |
| `post.delete` | Delete Post | Delete post | ✅ | ✅ |

### Audit Log
| Code | Name | Description | ADMIN | USER |
|------|------|-------------|-------|------|
| `audit.list` | List Audit Logs | View all audit logs | ✅ | ❌ |
| `audit.read` | Read Audit Log | View audit log details | ✅ | ❌ |
| `audit.me` | View My Logs | View own audit logs | ✅ | ✅ |

## Middleware

### 1. **verifyAllRole()**
Mengizinkan **semua user yang terautentikasi** untuk mengakses endpoint.

**Usage:**
```typescript
router.get('/profile', verifyAllRole(), controller.getProfile);
```

**Behavior:**
- ✅ Check token valid
- ✅ User authenticated
- ❌ TIDAK check permission
- ✅ Semua role bisa akses

### 2. **verifyToken(...permissions)**
Mengizinkan user yang **memiliki permission tertentu** untuk mengakses endpoint.

**Usage:**
```typescript
router.get('/users', verifyToken('user.list'), controller.getUsers);
router.post('/users', verifyToken('user.create'), controller.createUser);
```

**Behavior:**
- ✅ Check token valid
- ✅ User authenticated
- ✅ Check permission di database
- ✅ User harus punya minimal 1 permission yang diminta
- ❌ Access denied jika tidak punya permission

## Route Examples

### Format 1-Line (Recommended)
Semua routes ditulis dalam **1 line** untuk readability:

```typescript
// ✅ CORRECT - Dynamic permission check
router.get('/', verifyToken('user.list'), crudLimiter, validate(schema), controller.getUsers);
router.post('/', verifyToken('user.create'), crudLimiter, validate(schema), controller.createUser);
router.put('/:id', verifyToken('user.update'), crudLimiter, validate(schema), controller.updateUser);
router.delete('/:id', verifyToken('user.delete'), crudLimiter, validate(schema), controller.deleteUser);

// ✅ CORRECT - All authenticated users
router.get('/profile', verifyAllRole(), controller.getProfile);

// ❌ WRONG - Hardcode role
router.get('/', authorize('ADMIN'), controller.getUsers);
```

### User Routes
```typescript
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { verifyAllRole, verifyToken } from '../middleware/permission';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, getUserSchema, deleteUserSchema, listUsersSchema } from '../validators/user.validator';
import { crudLimiter } from '../middleware/rateLimiter';

const router = Router();
const userController = new UserController();

router.use(authenticate);

router.get('/profile', verifyAllRole(), userController.getProfile.bind(userController));
router.get('/', verifyToken('user.list'), crudLimiter, validate(listUsersSchema), userController.getUsers.bind(userController));
router.get('/:id', verifyToken('user.read'), crudLimiter, validate(getUserSchema), userController.getUserById.bind(userController));
router.post('/', verifyToken('user.create'), crudLimiter, validate(createUserSchema), userController.createUser.bind(userController));
router.put('/:id', verifyToken('user.update'), crudLimiter, validate(updateUserSchema), userController.updateUser.bind(userController));
router.delete('/:id', verifyToken('user.delete'), crudLimiter, validate(deleteUserSchema), userController.deleteUser.bind(userController));

export default router;
```

### Post Routes
```typescript
router.use(authenticate);

router.get('/', verifyToken('post.list'), crudLimiter, validate(listPostsSchema), postController.getPosts.bind(postController));
router.get('/:id', verifyToken('post.read'), crudLimiter, validate(getPostSchema), postController.getPostById.bind(postController));
router.post('/', verifyToken('post.create'), crudLimiter, validate(createPostSchema), postController.createPost.bind(postController));
router.put('/:id', verifyToken('post.update'), crudLimiter, validate(updatePostSchema), postController.updatePost.bind(postController));
router.delete('/:id', verifyToken('post.delete'), crudLimiter, validate(deletePostSchema), postController.deletePost.bind(postController));
```

### Audit Log Routes
```typescript
router.use(authenticate);

router.get('/me', verifyAllRole(), crudLimiter, auditLogController.getMyAuditLogs.bind(auditLogController));
router.get('/', verifyToken('audit.list'), crudLimiter, auditLogController.getAuditLogs.bind(auditLogController));
```

## Response Examples

### Success - User Has Permission
```bash
curl -X GET http://localhost:9005/api/v1/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "responCode": "01000001",
  "responMessage": "Users retrieved successfully",
  "status": "Operation completed successfully",
  "data": [...]
}
```

### Error - User Lacks Permission
```bash
curl -X GET http://localhost:9005/api/v1/users \
  -H "Authorization: Bearer USER_TOKEN"
```

**Response:**
```json
{
  "responCode": "12210001",
  "responMessage": "Access not permitted!",
  "status": "Authentication failed"
}
```

### Error - Invalid Token
```bash
curl -X GET http://localhost:9005/api/v1/users \
  -H "Authorization: Bearer invalid_token"
```

**Response:**
```json
{
  "responCode": "16210001",
  "responMessage": "Invalid token provided",
  "status": "Authentication failed"
}
```

## Adding New Permissions

### 1. Add to Database
```typescript
// prisma/seeds/permissions.seed.ts
const permissions: PermissionData[] = [
  // ... existing permissions
  { 
    code: 'report.view', 
    name: 'View Reports', 
    description: 'View system reports', 
    resource: 'report', 
    action: 'view' 
  },
];
```

### 2. Assign to Roles
```typescript
// Admin gets all permissions automatically

// For USER role
const userPermissionCodes = [
  // ... existing permissions
  'report.view',
];
```

### 3. Use in Routes
```typescript
router.get('/reports', verifyToken('report.view'), controller.getReports);
```

### 4. Run Seed
```bash
npm run prisma:seed
```

## Managing Permissions via API

### Get User Permissions
```typescript
import { getRolePermissions } from '../middleware/permission';

const permissions = await getRolePermissions('USER');
// Returns: ['user.profile', 'post.list', ...]
```

### Check Permission
```typescript
import { hasPermissions } from '../middleware/permission';

const canCreate = await hasPermissions('USER', ['user.create']);
// Returns: false
```

## Database Schema

### permissions Table
```sql
id          TEXT PRIMARY KEY
code        TEXT UNIQUE
name        TEXT
description TEXT
resource    TEXT
action      TEXT
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### role_permissions Table
```sql
id            TEXT PRIMARY KEY
role          UserRole (ADMIN | USER)
permission_id TEXT REFERENCES permissions(id)
created_at    TIMESTAMP

UNIQUE(role, permission_id)
```

## Benefits

1. **Dynamic**: Permission dapat diubah tanpa deploy ulang
2. **Scalable**: Mudah tambah permission baru
3. **Flexible**: Role baru dapat ditambahkan dengan mudah
4. **Maintainable**: Routes tidak hardcode role
5. **Secure**: Centralized permission checking
6. **Auditable**: Track permission changes di database

## Migration from Old System

### Before (Hardcoded)
```typescript
// ❌ OLD WAY
router.get('/', authorize('ADMIN'), controller.getUsers);
router.post('/', authorize('ADMIN'), controller.createUser);
```

### After (Permission-Based)
```typescript
// ✅ NEW WAY
router.get('/', verifyToken('user.list'), controller.getUsers);
router.post('/', verifyToken('user.create'), controller.createUser);
```

## Testing

### Test as Admin
```bash
# Login as admin
curl -X POST http://localhost:9005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

# Use token to access protected endpoint
curl -X GET http://localhost:9005/api/v1/users \
  -H "Authorization: Bearer {admin_token}"
```

### Test as User
```bash
# Login as user
curl -X POST http://localhost:9005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"User123!"}'

# Try to access admin-only endpoint (should fail)
curl -X GET http://localhost:9005/api/v1/users \
  -H "Authorization: Bearer {user_token}"
```

## Best Practices

1. **Use verifyAllRole() for general endpoints** - Profile, dashboard, common data
2. **Use verifyToken() for protected resources** - CRUD operations, sensitive data
3. **Keep permission codes consistent** - `{resource}.{action}` format
4. **Document permissions** - Update this file when adding new permissions
5. **Test both roles** - Ensure ADMIN has access, USER properly restricted
6. **1-line routes** - Keep routes readable and consistent
