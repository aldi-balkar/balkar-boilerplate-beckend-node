import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ResponseHelper } from '../helpers/response.helper';
import { ResponseCode } from '../constants/responseCodes';
import { StatusCode } from '../constants/statusCodes';
import { AuthRequest } from '../middleware/authenticate';
import { AssetService } from '../services/asset.service';
import { AuditAction } from '@prisma/client';

export class FileController {
  // Upload single file
  async uploadFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        ResponseHelper.error(res, ResponseCode.BAD_REQUEST, 'No file uploaded', undefined, StatusCode.VALIDATION_FAILED);
        return;
      }

      const { isPublic = false } = req.body;

      // Upload file (auto-route ke local atau asset service)
      const uploadResult = await AssetService.uploadFile(req.file, req.user!.id);

      // Save metadata ke database
      const fileRecord = await prisma.file.create({
        data: {
          originalName: req.file.originalname,
          storedName: uploadResult.storedName,
          filePath: uploadResult.filePath,
          mimeType: req.file.mimetype,
          size: req.file.size,
          storageType: uploadResult.storageType,
          assetServiceId: uploadResult.assetServiceId,
          assetServiceUrl: uploadResult.assetServiceUrl,
          uploadedBy: req.user!.id,
          isPublic: isPublic === 'true' || isPublic === true,
        },
        select: {
          id: true,
          originalName: true,
          storedName: true,
          mimeType: true,
          size: true,
          storageType: true,
          isPublic: true,
          createdAt: true,
        },
      });

      // Generate file URL
      const fileUrl = await AssetService.getFileUrl({
        storageType: uploadResult.storageType,
        storedName: uploadResult.storedName,
        filePath: uploadResult.filePath,
        assetServiceUrl: uploadResult.assetServiceUrl,
        assetServiceId: uploadResult.assetServiceId,
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: AuditAction.CREATE,
          entity: 'File',
          entityId: fileRecord.id,
          details: `File uploaded: ${fileRecord.originalName}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.created(res, { file: { ...fileRecord, url: fileUrl.url } }, 'File uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get file list
  async getFiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, mimeType, storageType } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        isDeleted: false,
        ...(req.user?.role !== 'ADMIN' && { uploadedBy: req.user?.id }),
        ...(mimeType && { mimeType: mimeType as string }),
        ...(storageType && { storageType: storageType as any }),
      };

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          skip,
          take: Number(limit),
          select: {
            id: true,
            originalName: true,
            storedName: true,
            mimeType: true,
            size: true,
            storageType: true,
            assetServiceUrl: true,
            isPublic: true,
            createdAt: true,
            uploader: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.file.count({ where }),
      ]);

      // Generate URLs untuk semua files
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const fileUrl = await AssetService.getFileUrl({
            storageType: file.storageType,
            storedName: file.storedName,
            filePath: '',
            assetServiceUrl: file.assetServiceUrl,
          });
          return { ...file, url: fileUrl.url };
        })
      );

      ResponseHelper.paginated(res, filesWithUrls, Number(page), Number(limit), total, 'Files retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get single file metadata
  async getFileById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const file = await prisma.file.findFirst({
        where: {
          id,
          isDeleted: false,
        },
        select: {
          id: true,
          originalName: true,
          storedName: true,
          filePath: true,
          mimeType: true,
          size: true,
          storageType: true,
          assetServiceId: true,
          assetServiceUrl: true,
          uploadedBy: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          uploader: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!file) {
        ResponseHelper.notFound(res, 'File');
        return;
      }

      // Check access permission
      if (!file.isPublic && req.user?.role !== 'ADMIN' && file.uploadedBy !== req.user?.id) {
        ResponseHelper.forbidden(res, 'Access denied to this file');
        return;
      }

      // Generate file URL
      const fileUrl = await AssetService.getFileUrl({
        storageType: file.storageType,
        storedName: file.storedName,
        filePath: file.filePath,
        assetServiceUrl: file.assetServiceUrl,
        assetServiceId: file.assetServiceId,
      });

      ResponseHelper.success(res, ResponseCode.SUCCESS, { file: { ...file, url: fileUrl.url } }, 'File retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Download/serve file
  async downloadFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { storedName } = req.params;

      const file = await prisma.file.findFirst({
        where: {
          storedName,
          isDeleted: false,
        },
        select: {
          id: true,
          originalName: true,
          storedName: true,
          filePath: true,
          mimeType: true,
          storageType: true,
          assetServiceUrl: true,
          uploadedBy: true,
          isPublic: true,
        },
      });

      if (!file) {
        ResponseHelper.notFound(res, 'File');
        return;
      }

      // Check access permission
      if (!file.isPublic && req.user?.role !== 'ADMIN' && file.uploadedBy !== req.user?.id) {
        ResponseHelper.forbidden(res, 'Access denied to this file');
        return;
      }

      // Get file buffer
      const fileBuffer = await AssetService.getFileBuffer({
        storageType: file.storageType,
        storedName: file.storedName,
        filePath: file.filePath,
        assetServiceUrl: file.assetServiceUrl,
      });

      // Set headers dan send file
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      res.send(fileBuffer);
    } catch (error) {
      next(error);
    }
  }

  // Delete file
  async deleteFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const file = await prisma.file.findFirst({
        where: {
          id,
          isDeleted: false,
        },
        select: {
          id: true,
          originalName: true,
          storedName: true,
          storageType: true,
          assetServiceId: true,
          uploadedBy: true,
        },
      });

      if (!file) {
        ResponseHelper.notFound(res, 'File');
        return;
      }

      // Check permission
      if (req.user?.role !== 'ADMIN' && file.uploadedBy !== req.user?.id) {
        ResponseHelper.forbidden(res, 'You can only delete your own files');
        return;
      }

      // Soft delete di database
      await prisma.file.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Hard delete file dari storage (background task)
      AssetService.deleteFile({
        storageType: file.storageType,
        storedName: file.storedName,
        assetServiceId: file.assetServiceId,
      }).catch((err) => console.error('Background file deletion error:', err));

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: AuditAction.DELETE,
          entity: 'File',
          entityId: file.id,
          details: `File deleted: ${file.originalName}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.deleted(res, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get storage info
  async getStorageInfo(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const storageInfo = AssetService.getStorageInfo();
      ResponseHelper.success(res, ResponseCode.SUCCESS, storageInfo, 'Storage info retrieved successfully', StatusCode.OK);
    } catch (error) {
      next(error);
    }
  }
}
