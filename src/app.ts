import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { httpLogger, requestId } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { AssetService } from './services/asset.service';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware with Swagger CSP configuration
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:", "validator.swagger.io"],
          },
        },
      })
    );
    
    // Disable x-powered-by header
    this.app.disable('x-powered-by');

    // CORS configuration
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Request ID and logging
    this.app.use(requestId);
    this.app.use(httpLogger);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Global rate limiting
    this.app.use('/api', globalLimiter);
  }

  private initializeRoutes(): void {
    // Swagger Documentation
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          
          /* Header Styling */
          .swagger-ui .information-container { 
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            padding: 35px;
            border-radius: 8px;
            margin-bottom: 25px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .swagger-ui .info { margin: 0; }
          .swagger-ui .info .title { 
            color: white !important;
            font-size: 36px !important;
            font-weight: 700 !important;
            margin-bottom: 12px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.15);
          }
          .swagger-ui .info .description { 
            color: rgba(255,255,255,0.95) !important;
            font-size: 16px;
            line-height: 1.6;
          }
          .swagger-ui .info a { color: #ffd700 !important; text-decoration: underline; }
          
          /* Operation Blocks */
          .swagger-ui .opblock { 
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 20px;
            border: 1px solid #e0e0e0 !important;
            overflow: hidden;
          }
          .swagger-ui .opblock:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            transform: translateY(-2px);
            transition: all 0.3s ease;
          }
          
          /* HTTP Method Colors */
          .swagger-ui .opblock.opblock-post { border-left: 5px solid #49cc90 !important; }
          .swagger-ui .opblock.opblock-get { border-left: 5px solid #61affe !important; }
          .swagger-ui .opblock.opblock-put { border-left: 5px solid #fca130 !important; }
          .swagger-ui .opblock.opblock-delete { border-left: 5px solid #f93e3e !important; }
          .swagger-ui .opblock.opblock-patch { border-left: 5px solid #50e3c2 !important; }
          
          .swagger-ui .opblock-summary-method {
            border-radius: 6px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 12px;
            padding: 8px 15px;
          }
          
          /* Buttons */
          .swagger-ui .btn { 
            border-radius: 6px;
            font-weight: 600;
            padding: 10px 20px;
            transition: all 0.3s ease;
          }
          .swagger-ui .btn.execute { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          .swagger-ui .btn.execute:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }
          .swagger-ui .btn.authorize { 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border: none;
            color: white;
            box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
          }
          .swagger-ui .btn.authorize:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
          }
          
          /* Auth Section */
          .swagger-ui .auth-wrapper {
            border-radius: 8px;
            background: #f8f9fa;
            padding: 20px;
          }
          .swagger-ui .auth-btn-wrapper { 
            display: flex;
            justify-content: center;
            padding: 20px 0;
          }
          
          /* Responses */
          .swagger-ui .responses-inner {
            border-radius: 8px;
            overflow: hidden;
          }
          .swagger-ui .response { 
            border-radius: 6px;
            margin-bottom: 10px;
          }
          .swagger-ui .response-col_status {
            font-weight: 700;
          }
          
          /* Tables */
          .swagger-ui table { 
            border-radius: 8px;
            overflow: hidden;
          }
          .swagger-ui table thead tr { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .swagger-ui table thead tr th { 
            color: white !important;
            font-weight: 700;
            padding: 15px;
          }
          
          /* Models */
          .swagger-ui .model-box { 
            border-radius: 8px;
            background: #f8f9fa;
            padding: 15px;
          }
          .swagger-ui .model-title { 
            color: #667eea !important;
            font-weight: 700;
          }
          
          /* Filter Box */
          .swagger-ui .filter-container { 
            margin-bottom: 20px;
          }
          .swagger-ui .filter .operation-filter-input {
            border-radius: 8px;
            border: 2px solid #e0e0e0;
            padding: 12px 20px;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          .swagger-ui .filter .operation-filter-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            outline: none;
          }
          
          /* Tags */
          .swagger-ui .opblock-tag {
            border-bottom: 2px solid #667eea;
            padding: 15px 0;
            margin: 30px 0 20px 0;
          }
          .swagger-ui .opblock-tag-section {
            margin-bottom: 30px;
          }
          
          /* Scrollbar */
          .swagger-ui ::-webkit-scrollbar { width: 10px; height: 10px; }
          .swagger-ui ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
          .swagger-ui ::-webkit-scrollbar-thumb { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
          }
          .swagger-ui ::-webkit-scrollbar-thumb:hover { background: #764ba2; }
          
          /* Animation */
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .swagger-ui .opblock { animation: slideIn 0.3s ease-out; }
        `,
        customSiteTitle: 'Balkar Boilerplate API Documentation',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
          persistAuthorization: true, // Keep token after refresh
          displayRequestDuration: true,
          docExpansion: 'none',
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true,
          deepLinking: true,
          displayOperationId: false,
        },
      })
    );

    // Swagger JSON
    this.app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'Backend Boilerplate API',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/api/health',
      });
    });
  }

  private initializeErrorHandling(): void {
    // Error handling middleware (must be last)
    this.app.use(errorHandler);
  }

  public async listen(): Promise<void> {
    const port = config.app.port;

    // Test database connection
    try {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error({ err: error }, '❌ Database connection failed');
      process.exit(1);
    }

    // Initialize storage directory
    try {
      await AssetService.initializeStorage();
    } catch (error) {
      logger.error({ err: error }, '❌ Failed to initialize storage');
      process.exit(1);
    }

    this.app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📝 Environment: ${config.app.env}`);
      logger.info(`🔗 API: http://localhost:${port}/api/${config.app.apiVersion}`);
      logger.info(`💚 Health: http://localhost:${port}/api/health`);
      logger.info(`📚 API Docs: http://localhost:${port}/api-docs`);
    });
  }
}

export default App;
