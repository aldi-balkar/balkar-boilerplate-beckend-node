import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Balkar Boilerplate API',
    version: '1.0.0',
    description: 'Enterprise-grade RESTful API with Express.js, TypeScript, Prisma ORM, and PostgreSQL. Built with JWT authentication and comprehensive API documentation.',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
      url: 'https://github.com/yourusername/balkar-boilerplate'
    },
    license: {
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.app.port}/api/${config.app.apiVersion}`,
      description: 'Development server',
    },
    {
      url: `https://api.yourdomain.com/api/${config.app.apiVersion}`,
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer {token}',
      },
    },
    schemas: {
      // Standard Response Schema
      ApiResponse: {
        type: 'object',
        properties: {
          responCode: {
            type: 'string',
            description: '8-digit response code (ResponseCode + StatusCode + ServiceCode)',
            example: '01000001',
          },
          responMessage: {
            type: 'string',
            description: 'Response message',
            example: 'Success',
          },
          status: {
            type: 'string',
            description: 'Status description',
            example: 'OK',
          },
          data: {
            type: 'object',
            description: 'Response data payload',
          },
          errors: {
            oneOf: [
              { type: 'string' },
              {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ValidationError',
                },
              },
            ],
            description: 'Error details',
          },
          meta: {
            $ref: '#/components/schemas/ResponseMeta',
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            example: 'email',
          },
          message: {
            type: 'string',
            example: 'Email is required',
          },
        },
      },
      ResponseMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          total: {
            type: 'integer',
            example: 100,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-12-30T22:00:00.000Z',
          },
        },
      },
      // User Schema
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'cm59abc123xyz',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN'],
            example: 'USER',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      // Post Schema
      Post: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'cm59post123xyz',
          },
          title: {
            type: 'string',
            example: 'My First Post',
          },
          content: {
            type: 'string',
            example: 'This is the content of my post',
          },
          published: {
            type: 'boolean',
            example: true,
          },
          authorId: {
            type: 'string',
            example: 'cm59abc123xyz',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      // File Schema
      File: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'cm59file123xyz',
          },
          originalName: {
            type: 'string',
            example: 'document.pdf',
          },
          storedName: {
            type: 'string',
            example: 'abc123-uuid-xyz.pdf',
          },
          filePath: {
            type: 'string',
            example: '/uploads/abc123-uuid-xyz.pdf',
          },
          mimeType: {
            type: 'string',
            example: 'application/pdf',
          },
          size: {
            type: 'integer',
            example: 1024000,
          },
          storageType: {
            type: 'string',
            enum: ['local', 'asset_service'],
            example: 'local',
          },
          url: {
            type: 'string',
            example: 'http://localhost:9005/api/v1/files/download/abc123-uuid-xyz.pdf',
          },
          uploadedBy: {
            type: 'string',
            example: 'cm59abc123xyz',
          },
          isPublic: {
            type: 'boolean',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      // Audit Log Schema
      AuditLog: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'cm59audit123xyz',
          },
          userId: {
            type: 'string',
            example: 'cm59abc123xyz',
          },
          action: {
            type: 'string',
            enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'],
            example: 'CREATE',
          },
          entity: {
            type: 'string',
            example: 'User',
          },
          entityId: {
            type: 'string',
            example: 'cm59abc123xyz',
          },
          details: {
            type: 'string',
            example: 'User created successfully',
          },
          ipAddress: {
            type: 'string',
            example: '192.168.1.1',
          },
          userAgent: {
            type: 'string',
            example: 'Mozilla/5.0...',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      // Error Response Schema
      ErrorResponse: {
        type: 'object',
        properties: {
          responCode: {
            type: 'string',
            example: '02000001',
          },
          responMessage: {
            type: 'string',
            example: 'Bad Request',
          },
          status: {
            type: 'string',
            example: 'VALIDATION_FAILED',
          },
          errors: {
            oneOf: [
              { type: 'string' },
              {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ValidationError',
                },
              },
            ],
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized - Invalid or missing token',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              responCode: '04000001',
              responMessage: 'Authentication required',
              status: 'OK',
              errors: 'Invalid or expired token',
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              responCode: '05000001',
              responMessage: 'Forbidden',
              status: 'OK',
              errors: 'You do not have permission to access this resource',
            },
          },
        },
      },
      NotFound: {
        description: 'Not Found - Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              responCode: '06000001',
              responMessage: 'Not Found',
              status: 'OK',
              errors: 'Resource not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation Error - Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              responCode: '02000002',
              responMessage: 'Validation Error',
              status: 'VALIDATION_FAILED',
              errors: [
                {
                  field: 'email',
                  message: 'Email is required',
                },
                {
                  field: 'password',
                  message: 'Password must be at least 8 characters',
                },
              ],
            },
          },
        },
      },
      InternalError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              responCode: '07000001',
              responMessage: 'Internal Server Error',
              status: 'INTERNAL_SERVER_ERROR',
              errors: 'An unexpected error occurred',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints including register, login, token refresh, and SSO integration',
    },
    {
      name: 'Users',
      description: 'User management endpoints for profile operations and role-based access control',
    },
    {
      name: 'Posts',
      description: 'Post management endpoints for CRUD operations',
    },
    {
      name: 'Files',
      description: 'File management endpoints for upload, download, and metadata operations',
    },
    {
      name: 'Email',
      description: 'Email service endpoints with template support and multi-provider configuration',
    },
    {
      name: 'Audit Logs',
      description: 'Audit logging endpoints for tracking user activities and system events',
    },
    {
      name: 'Health',
      description: 'Health check endpoints for API monitoring',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    './src/docs/*.ts',
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
