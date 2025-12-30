/**
 * File Upload Types
 * Types untuk file upload system dengan dual storage
 */

export enum StorageType {
  LOCAL = 'local',
  ASSET_SERVICE = 'asset_service',
}

export interface FileUploadRequest {
  file: Express.Multer.File;
  isPublic?: boolean;
  userId: string;
}

export interface FileMetadata {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  mimeType: string;
  size: number;
  storageType: StorageType;
  assetServiceId?: string;
  assetServiceUrl?: string;
  uploadedBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetServiceUploadResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    mimeType: string;
    size: number;
    createdAt: string;
  };
  error?: string;
  message?: string;
}

export interface AssetServiceDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface FileUrlResponse {
  url: string;
  storageType: StorageType;
  expiresIn?: number;
}

export interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
}
