import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import {
  StorageType,
  AssetServiceUploadResponse,
  AssetServiceDeleteResponse,
  FileUrlResponse,
} from '../types/file.types';

/**
 * Asset Service
 * Dual storage system: Local atau Asset Service
 * Auto-detection saat get file berdasarkan storage_type di database
 */
export class AssetService {
  private static uploadPath = config.asset.localUploadPath;

  /**
   * Initialize upload directory untuk local storage
   */
  static async initializeStorage(): Promise<void> {
    if (!config.asset.serviceEnabled) {
      try {
        await fs.mkdir(this.uploadPath, { recursive: true });
        console.log(`✅ Local upload directory initialized: ${this.uploadPath}`);
      } catch (error) {
        console.error('Failed to create upload directory:', error);
        throw error;
      }
    }
  }

  /**
   * Upload file - Auto route ke local atau asset service
   * @param file - Multer file object
   * @param userId - User ID yang upload
   */
  static async uploadFile(
    file: Express.Multer.File,
    userId: string
  ): Promise<{
    storedName: string;
    filePath: string;
    storageType: StorageType;
    assetServiceId?: string;
    assetServiceUrl?: string;
  }> {
    // Validate file
    this.validateFile(file);

    // Route berdasarkan config
    if (config.asset.serviceEnabled && config.asset.serviceUrl) {
      return await this.uploadToAssetService(file, userId);
    } else {
      return await this.uploadToLocal(file);
    }
  }

  /**
   * Upload ke local storage
   */
  private static async uploadToLocal(
    file: Express.Multer.File
  ): Promise<{
    storedName: string;
    filePath: string;
    storageType: StorageType;
  }> {
    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const storedName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(this.uploadPath, storedName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    return {
      storedName,
      filePath: `/${storedName}`, // Relative path untuk URL
      storageType: StorageType.LOCAL,
    };
  }

  /**
   * Upload ke Asset Service
   */
  private static async uploadToAssetService(
    file: Express.Multer.File,
    userId: string
  ): Promise<{
    storedName: string;
    filePath: string;
    storageType: StorageType;
    assetServiceId?: string;
    assetServiceUrl?: string;
  }> {
    try {
      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('file', blob, file.originalname);
      formData.append('userId', userId);

      const response = await axios.post<AssetServiceUploadResponse>(
        `${config.asset.serviceUrl}/api/v1/files/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${config.asset.apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Asset service upload failed');
      }

      const assetData = response.data.data;

      return {
        storedName: assetData.filename,
        filePath: assetData.url,
        storageType: StorageType.ASSET_SERVICE,
        assetServiceId: assetData.id,
        assetServiceUrl: assetData.url,
      };
    } catch (error) {
      console.error('Asset service upload error:', error);
      
      // Fallback ke local storage jika asset service gagal
      console.warn('⚠️  Asset service unavailable, falling back to local storage');
      const localResult = await this.uploadToLocal(file);
      return {
        ...localResult,
        assetServiceId: undefined,
        assetServiceUrl: undefined,
      };
    }
  }

  /**
   * Get file URL berdasarkan storage type
   * Auto-detection dari database record
   */
  static async getFileUrl(fileRecord: {
    storageType: string;
    storedName: string;
    filePath: string;
    assetServiceUrl?: string | null;
    assetServiceId?: string | null;
  }): Promise<FileUrlResponse> {
    if (fileRecord.storageType === StorageType.ASSET_SERVICE) {
      // Jika dari asset service, return URL dari asset service
      if (fileRecord.assetServiceUrl) {
        return {
          url: fileRecord.assetServiceUrl,
          storageType: StorageType.ASSET_SERVICE,
        };
      }
      
      // Jika tidak ada URL tapi ada ID, construct URL
      if (fileRecord.assetServiceId && config.asset.serviceUrl) {
        return {
          url: `${config.asset.serviceUrl}/api/v1/files/${fileRecord.assetServiceId}`,
          storageType: StorageType.ASSET_SERVICE,
        };
      }
    }

    // Default: local storage
    // Generate URL berdasarkan base URL aplikasi
    const baseUrl = config.app.isProduction 
      ? process.env.APP_URL || `http://localhost:${config.app.port}`
      : `http://localhost:${config.app.port}`;

    return {
      url: `${baseUrl}/api/v1/files/${fileRecord.storedName}`,
      storageType: StorageType.LOCAL,
    };
  }

  /**
   * Get file buffer - untuk serve file
   */
  static async getFileBuffer(fileRecord: {
    storageType: string;
    storedName: string;
    filePath: string;
    assetServiceUrl?: string | null;
  }): Promise<Buffer> {
    if (fileRecord.storageType === StorageType.ASSET_SERVICE) {
      // Fetch dari asset service
      if (fileRecord.assetServiceUrl) {
        const response = await axios.get(fileRecord.assetServiceUrl, {
          responseType: 'arraybuffer',
          headers: {
            'Authorization': `Bearer ${config.asset.apiKey}`,
          },
        });
        return Buffer.from(response.data);
      }
      throw new Error('Asset service URL not found');
    }

    // Read dari local storage
    const filePath = path.join(this.uploadPath, fileRecord.storedName);
    return await fs.readFile(filePath);
  }

  /**
   * Delete file - Route ke local atau asset service
   */
  static async deleteFile(fileRecord: {
    storageType: string;
    storedName: string;
    assetServiceId?: string | null;
  }): Promise<boolean> {
    try {
      if (fileRecord.storageType === StorageType.ASSET_SERVICE && fileRecord.assetServiceId) {
        return await this.deleteFromAssetService(fileRecord.assetServiceId);
      } else {
        return await this.deleteFromLocal(fileRecord.storedName);
      }
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  /**
   * Delete dari local storage
   */
  private static async deleteFromLocal(storedName: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadPath, storedName);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Delete local file error:', error);
      return false;
    }
  }

  /**
   * Delete dari asset service
   */
  private static async deleteFromAssetService(assetServiceId: string): Promise<boolean> {
    try {
      const response = await axios.delete<AssetServiceDeleteResponse>(
        `${config.asset.serviceUrl}/api/v1/files/${assetServiceId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.asset.apiKey}`,
          },
          timeout: 10000,
        }
      );

      return response.data.success;
    } catch (error) {
      console.error('Delete from asset service error:', error);
      return false;
    }
  }

  /**
   * Validate file sebelum upload
   */
  private static validateFile(file: Express.Multer.File): void {
    // Check file size
    const maxSize = config.asset.serviceEnabled
      ? config.asset.maxFileSize
      : config.asset.maxLocalFileSize;

    if (file.size > maxSize) {
      throw new Error(
        `File size exceeds maximum allowed size of ${this.formatBytes(maxSize)}`
      );
    }

    // Check mime type
    if (!config.asset.allowedFileTypes.includes(file.mimetype)) {
      throw new Error(
        `File type ${file.mimetype} is not allowed. Allowed types: ${config.asset.allowedFileTypes.join(', ')}`
      );
    }
  }

  /**
   * Format bytes ke human readable
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get storage info
   */
  static getStorageInfo() {
    return {
      assetServiceEnabled: config.asset.serviceEnabled,
      assetServiceUrl: config.asset.serviceUrl,
      hasApiKey: !!config.asset.apiKey,
      maxFileSize: config.asset.serviceEnabled
        ? config.asset.maxFileSize
        : config.asset.maxLocalFileSize,
      allowedTypes: config.asset.allowedFileTypes,
      localUploadPath: this.uploadPath,
      currentStorage: config.asset.serviceEnabled ? 'asset_service' : 'local',
    };
  }
}
