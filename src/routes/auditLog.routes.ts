import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLog.controller';
import { authenticate } from '../middleware/authenticate';
import { verifyAllRole, verifyToken } from '../middleware/permission';
import { crudLimiter } from '../middleware/rateLimiter';

const router = Router();
const auditLogController = new AuditLogController();

// All routes require authentication
router.use(authenticate);

// Get current user's audit logs - All authenticated users
router.get('/me', verifyAllRole(), crudLimiter, auditLogController.getMyAuditLogs.bind(auditLogController));

// Admin only - get all audit logs with permission
router.get('/', verifyToken('audit.list'), crudLimiter, auditLogController.getAuditLogs.bind(auditLogController));

export default router;
