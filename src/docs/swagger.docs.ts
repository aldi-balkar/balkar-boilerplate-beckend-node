/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: admin123
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: password123
 *         name:
 *           type: string
 *           example: John Doe
 *
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             example:
 *               responCode: "01000001"
 *               responMessage: "User registered successfully"
 *               status: "OK"
 *               data:
 *                 user:
 *                   id: "cm59abc123"
 *                   email: "user@example.com"
 *                   name: "John Doe"
 *                   role: "USER"
 *                 tokens:
 *                   accessToken: "eyJhbGc..."
 *                   refreshToken: "eyJhbGc..."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               responCode: "01000001"
 *               responMessage: "Login successful"
 *               status: "OK"
 *               data:
 *                 user:
 *                   id: "cm59abc123"
 *                   email: "admin@example.com"
 *                   name: "Admin User"
 *                   role: "ADMIN"
 *                 tokens:
 *                   accessToken: "eyJhbGc..."
 *                   refreshToken: "eyJhbGc..."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful
 *
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Users list retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get my profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   put:
 *     tags: [Users]
 *     summary: Update my profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               email:
 *                 type: string
 *                 example: john.updated@example.com
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     tags: [Users]
 *     summary: Update user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get all posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Posts list retrieved
 *
 *   post:
 *     tags: [Posts]
 *     summary: Create new post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: My First Post
 *               content:
 *                 type: string
 *                 example: This is the content
 *               published:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Post created
 *
 * /posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get post by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post retrieved
 *
 *   put:
 *     tags: [Posts]
 *     summary: Update post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post updated
 *
 *   delete:
 *     tags: [Posts]
 *     summary: Delete post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *
 * /files:
 *   get:
 *     tags: [Files]
 *     summary: Get all files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 20
 *       - in: query
 *         name: mimeType
 *         schema:
 *           type: string
 *       - in: query
 *         name: storageType
 *         schema:
 *           type: string
 *           enum: [local, asset_service]
 *     responses:
 *       200:
 *         description: Files list retrieved
 *
 *   post:
 *     tags: [Files]
 *     summary: Upload file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               isPublic:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               responCode: "01000001"
 *               responMessage: "File uploaded successfully"
 *               status: "OK"
 *               data:
 *                 file:
 *                   id: "cm59file123"
 *                   originalName: "document.pdf"
 *                   storedName: "abc123-uuid.pdf"
 *                   mimeType: "application/pdf"
 *                   size: 1024000
 *                   storageType: "local"
 *                   url: "http://localhost:9005/api/v1/files/download/abc123-uuid.pdf"
 *
 * /files/info:
 *   get:
 *     tags: [Files]
 *     summary: Get storage configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage info retrieved
 *
 * /files/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Get file metadata
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File metadata retrieved
 *
 *   delete:
 *     tags: [Files]
 *     summary: Delete file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted
 *
 * /files/download/{storedName}:
 *   get:
 *     tags: [Files]
 *     summary: Download file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storedName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *
 * /email/send:
 *   post:
 *     tags: [Email]
 *     summary: Send custom email (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *             properties:
 *               to:
 *                 oneOf:
 *                   - type: string
 *                     example: user@example.com
 *                   - type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *               subject:
 *                 type: string
 *                 example: Test Email
 *               html:
 *                 type: string
 *                 example: <h1>Hello</h1>
 *               text:
 *                 type: string
 *                 example: Hello
 *               cc:
 *                 type: array
 *                 items:
 *                   type: object
 *               bcc:
 *                 type: array
 *                 items:
 *                   type: object
 *               replyTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               responCode: "01000001"
 *               responMessage: "Email sent successfully"
 *               status: "OK"
 *               data:
 *                 messageId: "abc123xyz"
 *                 provider: "smtp"
 *
 * /email/send-template:
 *   post:
 *     tags: [Email]
 *     summary: Send templated email (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - templateType
 *               - data
 *             properties:
 *               to:
 *                 type: string
 *                 example: user@example.com
 *               templateType:
 *                 type: string
 *                 enum: [welcome, password_reset, verification, notification]
 *                 example: welcome
 *               data:
 *                 type: object
 *                 example:
 *                   name: John Doe
 *                   appName: My App
 *     responses:
 *       200:
 *         description: Email sent
 *
 * /email/provider-info:
 *   get:
 *     tags: [Email]
 *     summary: Get email provider info (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider info retrieved
 *
 * /email/verify-smtp:
 *   get:
 *     tags: [Email]
 *     summary: Verify SMTP connection (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SMTP verified
 *
 * /email/templates:
 *   get:
 *     tags: [Email]
 *     summary: Get available templates (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates list retrieved
 *
 * /audit-logs:
 *   get:
 *     tags: [Audit Logs]
 *     summary: Get all audit logs (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT]
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved
 *
 * /audit-logs/me:
 *   get:
 *     tags: [Audit Logs]
 *     summary: Get my audit logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: My audit logs retrieved
 *
 * /audit-logs/{id}:
 *   get:
 *     tags: [Audit Logs]
 *     summary: Get audit log by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log retrieved
 */

// This file is imported by swagger.ts to include all API documentation
export {};
