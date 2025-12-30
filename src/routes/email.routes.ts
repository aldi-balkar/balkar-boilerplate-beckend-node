import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { verifyToken } from '../middleware/permission';
import {
  sendCustomEmail,
  sendTemplatedEmail,
  getEmailProviderInfo,
  verifySmtpConnection,
  getAvailableTemplates,
} from '../controllers/email.controller';

const router = Router();

// All email routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/email/send
 * @desc    Send custom email (admin only)
 * @access  Private (email.send permission)
 */
router.post('/send', verifyToken('email.send'), sendCustomEmail);

/**
 * @route   POST /api/email/send-template
 * @desc    Send templated email (admin only)
 * @access  Private (email.send permission)
 */
router.post('/send-template', verifyToken('email.send'), sendTemplatedEmail);

/**
 * @route   GET /api/email/provider-info
 * @desc    Get email provider information (admin only)
 * @access  Private (email.view permission)
 */
router.get('/provider-info', verifyToken('email.view'), getEmailProviderInfo);

/**
 * @route   GET /api/email/verify-smtp
 * @desc    Verify SMTP connection (admin only)
 * @access  Private (email.view permission)
 */
router.get('/verify-smtp', verifyToken('email.view'), verifySmtpConnection);

/**
 * @route   GET /api/email/templates
 * @desc    Get available email templates (admin only)
 * @access  Private (email.view permission)
 */
router.get('/templates', verifyToken('email.view'), getAvailableTemplates);

export default router;
