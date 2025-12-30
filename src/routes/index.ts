import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import auditLogRoutes from './auditLog.routes';
import fileRoutes from './file.routes';
import emailRoutes from './email.routes';
import healthRoutes from './health.routes';
import { config } from '../config/env';

const router = Router();

const apiVersion = config.app.apiVersion;

// Health check (no versioning)
router.use('/health', healthRoutes);

// API v1 routes
router.use(`/${apiVersion}/auth`, authRoutes);
router.use(`/${apiVersion}/users`, userRoutes);
router.use(`/${apiVersion}/posts`, postRoutes);
router.use(`/${apiVersion}/audit-logs`, auditLogRoutes);
router.use(`/${apiVersion}/files`, fileRoutes);
router.use(`/${apiVersion}/email`, emailRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

export default router;
