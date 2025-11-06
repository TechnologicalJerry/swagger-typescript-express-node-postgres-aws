import { s3, awsConfig } from '../config/aws';
import { logger } from '../config/logger';

export interface UploadFileParams {
  file: Express.Multer.File;
  folder?: string;
  fileName?: string;
}

export interface DeleteFileParams {
  key: string;
}

export class S3Service {
  private bucketName: string;

  constructor() {
    this.bucketName = awsConfig.s3Bucket;
    if (!this.bucketName) {
      logger.warn('S3_BUCKET_NAME not configured');
    }
  }

  async uploadFile({ file, folder = 'uploads', fileName }: UploadFileParams): Promise<string> {
    if (!this.bucketName) {
      throw new Error('S3 bucket not configured');
    }

    const key = fileName 
      ? `${folder}/${fileName}` 
      : `${folder}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as const,
    };

    try {
      const result = await s3.upload(params).promise();
      logger.info(`File uploaded to S3: ${result.Location}`);
      return result.Location;
    } catch (error) {
      logger.error('Error uploading file to S3', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async deleteFile({ key }: DeleteFileParams): Promise<void> {
    if (!this.bucketName) {
      throw new Error('S3 bucket not configured');
    }

    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
      logger.info(`File deleted from S3: ${key}`);
    } catch (error) {
      logger.error('Error deleting file from S3', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!this.bucketName) {
      throw new Error('S3 bucket not configured');
    }

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn,
    };

    try {
      return s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      logger.error('Error generating signed URL', error);
      throw new Error('Failed to generate file URL');
    }
  }
}

export const s3Service = new S3Service();

