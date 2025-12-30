/**
 * Auth Routes Swagger Documentation
 * 
 * Add these annotations above each route in auth.routes.ts
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user
 *     description: Create a new user account with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               responCode: "01000001"
 *               responMessage: "User registered successfully"
 *               status: "OK"
 *               data:
 *                 user:
 *                   id: "cm59abc123xyz"
 *                   email: "user@example.com"
 *                   name: "John Doe"
 *                   role: "USER"
 *                 tokens:
 *                   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: Authenticate with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
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
 *                   id: "cm59abc123xyz"
 *                   email: "admin@example.com"
 *                   name: "Admin User"
 *                   role: "ADMIN"
 *                 tokens:
 *                   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials
 *
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh token
 *     description: Get new access token using refresh token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             example:
 *               responCode: "01000001"
 *               responMessage: "Token refreshed"
 *               status: "OK"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     description: Invalidate user session
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful
 *
 * @swagger
 * /auth/sso/login:
 *   post:
 *     tags: [Auth]
 *     summary: SSO Login
 *     description: Login using SSO token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ssoToken
 *             properties:
 *               ssoToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: SSO login successful
 *         content:
 *           application/json:
 *             example:
 *               responCode: "01000001"
 *               responMessage: "SSO login successful"
 *               status: "OK"
 *               data:
 *                 user:
 *                   id: "cm59abc123xyz"
 *                   email: "user@sso.com"
 *                   name: "SSO User"
 *                 tokens:
 *                   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 * @swagger
 * /auth/sso/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify SSO Token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ssoToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token verified
 *
 * @swagger
 * /auth/sso/info:
 *   get:
 *     tags: [Auth]
 *     summary: Get SSO Info
 *     security: []
 *     responses:
 *       200:
 *         description: SSO configuration
 */
