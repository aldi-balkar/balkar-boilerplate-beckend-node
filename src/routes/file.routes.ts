import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/authenticate';
import { verifyAllRole, verifyToken } from '../middleware/permission';
import { uploadSingle } from '../middleware/upload';
import { crudLimiter } from '../middleware/rateLimiter';

const router = Router();
const fileController = new FileController();

router.use(authenticate);

router.post('/', verifyToken('file.create'), crudLimiter, uploadSingle, fileController.uploadFile.bind(fileController));
router.get('/', verifyToken('file.list'), crudLimiter, fileController.getFiles.bind(fileController));
router.get('/info', verifyAllRole(), fileController.getStorageInfo.bind(fileController));
router.get('/:id', verifyToken('file.read'), crudLimiter, fileController.getFileById.bind(fileController));
router.get('/download/:storedName', verifyAllRole(), fileController.downloadFile.bind(fileController));
router.delete('/:id', verifyToken('file.delete'), crudLimiter, fileController.deleteFile.bind(fileController));

export default router;
