# 📚 API DOCUMENTATION

Base URL: `http://localhost:3000/api/v1`

## 📑 Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Posts](#posts)
- [Audit Logs](#audit-logs)
- [Health Check](#health-check)
- [Error Responses](#error-responses)

---

## 🔐 Authentication

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Rate Limit:** 3 requests/minute

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `email`: Valid email format
- `username`: 3-30 chars, alphanumeric + underscore only
- `password`: Min 8 chars, must include uppercase, lowercase, number, special char

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxyz123...",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Email or username already exists"
}
```

---

### Login

Authenticate and receive access & refresh tokens.

**Endpoint:** `POST /auth/login`

**Rate Limit:** 5 requests/minute

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clxyz123...",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Rate Limit:** 10 requests/minute

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Note:** Old refresh token is automatically revoked (token rotation).

---

### Logout

Revoke refresh token.

**Endpoint:** `POST /auth/logout`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👤 Users

All user endpoints require authentication via Bearer token.

**Headers:**
```
Authorization: Bearer {accessToken}
```

---

### Get Profile

Get current user's profile.

**Endpoint:** `GET /users/profile`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "clxyz123...",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Get All Users (Admin Only)

List all users with pagination and filters.

**Endpoint:** `GET /users`

**Rate Limit:** 100 requests/minute

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `role` (optional): Filter by role (ADMIN | USER)
- `isActive` (optional): Filter by active status (true | false)
- `search` (optional): Search in email/username

**Example:**
```
GET /users?page=1&limit=10&role=USER&search=john
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "clxyz123...",
        "email": "user@example.com",
        "username": "johndoe",
        "role": "USER",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### Get User by ID (Admin Only)

Get specific user details.

**Endpoint:** `GET /users/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "clxyz123...",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Create User (Admin Only)

Create a new user.

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "role": "USER"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "clxyz456...",
      "email": "newuser@example.com",
      "username": "newuser",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Update User

Update user information.

**Endpoint:** `PUT /users/:id`

**Permissions:**
- Users can update their own profile
- Admins can update any user
- Only admins can change `role` and `isActive`

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "username": "newusername",
  "password": "NewSecurePass123!",
  "role": "ADMIN",
  "isActive": false
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "clxyz123...",
      "email": "newemail@example.com",
      "username": "newusername",
      "role": "ADMIN",
      "isActive": false,
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Delete User (Admin Only)

Delete a user.

**Endpoint:** `DELETE /users/:id`

**Note:** Cannot delete own account.

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📝 Posts

All post endpoints require authentication.

---

### Get All Posts

List posts with pagination, filtering, and sorting.

**Endpoint:** `GET /posts`

**Rate Limit:** 100 requests/minute

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `published` (optional): Filter by published status (true | false)
- `search` (optional): Search in title/content
- `sortBy` (optional): Sort field (createdAt | updatedAt | title)
- `sortOrder` (optional): Sort direction (asc | desc)

**Example:**
```
GET /posts?page=1&limit=10&published=true&sortBy=createdAt&sortOrder=desc
```

**Permissions:**
- Regular users see: Published posts + their own posts
- Admins see: All posts

**Success Response (200):**
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "posts": [
      {
        "id": "clxyz789...",
        "title": "My First Post",
        "content": "Post content here...",
        "published": true,
        "isDeleted": false,
        "deletedAt": null,
        "authorId": "clxyz123...",
        "author": {
          "id": "clxyz123...",
          "username": "johndoe",
          "email": "user@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

---

### Get Post by ID

Get specific post details.

**Endpoint:** `GET /posts/:id`

**Permissions:**
- Can view published posts
- Can view own unpublished posts
- Admins can view any post

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post retrieved successfully",
  "data": {
    "post": {
      "id": "clxyz789...",
      "title": "My First Post",
      "content": "Post content here...",
      "published": true,
      "isDeleted": false,
      "deletedAt": null,
      "authorId": "clxyz123...",
      "author": {
        "id": "clxyz123...",
        "username": "johndoe",
        "email": "user@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Create Post

Create a new post.

**Endpoint:** `POST /posts`

**Request Body:**
```json
{
  "title": "My Awesome Post",
  "content": "This is the post content. It can be quite long...",
  "published": true
}
```

**Validation:**
- `title`: 1-255 characters
- `content`: Required, no max length
- `published`: Optional boolean (default: false)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {
      "id": "clxyz789...",
      "title": "My Awesome Post",
      "content": "This is the post content...",
      "published": true,
      "isDeleted": false,
      "deletedAt": null,
      "authorId": "clxyz123...",
      "author": {
        "id": "clxyz123...",
        "username": "johndoe",
        "email": "user@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Update Post

Update existing post.

**Endpoint:** `PUT /posts/:id`

**Permissions:**
- Users can update their own posts
- Admins can update any post

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "published": true
}
```

**Note:** All fields optional. Only provided fields updated.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "post": {
      "id": "clxyz789...",
      "title": "Updated Title",
      "content": "Updated content...",
      "published": true,
      "author": {
        "id": "clxyz123...",
        "username": "johndoe",
        "email": "user@example.com"
      },
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Delete Post (Soft Delete)

Soft delete a post.

**Endpoint:** `DELETE /posts/:id`

**Permissions:**
- Users can delete their own posts
- Admins can delete any post

**Note:** Post is marked as deleted but remains in database.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

## 📋 Audit Logs

Track all important system activities.

---

### Get My Audit Logs

Get current user's activity logs.

**Endpoint:** `GET /audit-logs/me`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Your audit logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": "clxyz999...",
        "userId": "clxyz123...",
        "action": "LOGIN",
        "entity": "User",
        "entityId": "clxyz123...",
        "details": "User logged in: user@example.com",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### Get All Audit Logs (Admin Only)

Get system-wide audit logs.

**Endpoint:** `GET /audit-logs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `action` (optional): Filter by action (LOGIN | REGISTER | CREATE | UPDATE | DELETE | LOGOUT)
- `entity` (optional): Filter by entity (User | Post)
- `userId` (optional): Filter by user ID
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Example:**
```
GET /audit-logs?action=LOGIN&entity=User&startDate=2024-01-01T00:00:00Z
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": "clxyz999...",
        "userId": "clxyz123...",
        "user": {
          "id": "clxyz123...",
          "email": "user@example.com",
          "username": "johndoe"
        },
        "action": "LOGIN",
        "entity": "User",
        "entityId": "clxyz123...",
        "details": "User logged in: user@example.com",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "totalPages": 5
    }
  }
}
```

---

## 💚 Health Check

Check API health and database connectivity.

**Endpoint:** `GET /api/health`

**No authentication required**

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 12345.67,
    "environment": "production",
    "version": "1.0.0",
    "database": "connected"
  }
}
```

**Error Response (503):**
```json
{
  "success": false,
  "message": "Service unavailable"
}
```

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {} // Optional, for validation errors
}
```

### Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input/validation failed |
| 401 | Unauthorized | Authentication required/failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (email, username) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |
| 503 | Service Unavailable | Service/database down |

### Validation Error Example

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    },
    {
      "field": "body.password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Rate Limit Error Example

```json
{
  "success": false,
  "message": "Too many login attempts, please try again after a minute"
}
```

---

## 🔐 Authentication Flow

### 1. Initial Authentication
```
1. POST /auth/register or /auth/login
2. Receive accessToken & refreshToken
3. Store tokens securely
4. Use accessToken in Authorization header
```

### 2. Making Authenticated Requests
```
Authorization: Bearer {accessToken}
```

### 3. Token Refresh
```
When accessToken expires (401 error):
1. POST /auth/refresh with refreshToken
2. Receive new accessToken & refreshToken
3. Update stored tokens
4. Retry original request with new accessToken
```

### 4. Logout
```
1. POST /auth/logout with refreshToken
2. Clear stored tokens
3. Redirect to login
```

---

## 📦 Postman Collection

Import `postman_collection.json` to test all endpoints easily.

Collection includes:
- Pre-configured requests
- Auto-token management
- Environment variables
- Example requests

---

## 🔗 Related Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Security Guide](SECURITY.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Project Structure](STRUCTURE.md)

---

**📧 API Support:** support@your-domain.com
