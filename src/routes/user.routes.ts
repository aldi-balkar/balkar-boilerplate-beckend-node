import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { verifyAllRole, verifyToken } from '../middleware/permission';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, getUserSchema, deleteUserSchema, listUsersSchema } from '../validators/user.validator';
import { crudLimiter } from '../middleware/rateLimiter';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// Get current user profile - All authenticated users
router.get('/profile', verifyAllRole(), userController.getProfile.bind(userController));

// Admin routes with permission check
router.get('/', verifyToken('user.list'), crudLimiter, validate(listUsersSchema), userController.getUsers.bind(userController));
router.get('/:id', verifyToken('user.read'), crudLimiter, validate(getUserSchema), userController.getUserById.bind(userController));
router.post('/', verifyToken('user.create'), crudLimiter, validate(createUserSchema), userController.createUser.bind(userController));
router.put('/:id', verifyToken('user.update'), crudLimiter, validate(updateUserSchema), userController.updateUser.bind(userController));
router.delete('/:id', verifyToken('user.delete'), crudLimiter, validate(deleteUserSchema), userController.deleteUser.bind(userController));

export default router;
