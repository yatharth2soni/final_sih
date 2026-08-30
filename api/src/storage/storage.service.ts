import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

export interface StoredFileResult {
  attachmentId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  storageKey: string;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly localStorageDir: string;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucketName = this.configService.get<string>('storage.bucket') || 'khanan-suraksha';
    this.localStorageDir = path.join(process.cwd(), 'uploads', this.bucketName);

    // Ensure local upload directory exists as safe fallback
    if (!fs.existsSync(this.localStorageDir)) {
      fs.mkdirSync(this.localStorageDir, { recursive: true });
    }
  }

  /**
   * Upload and record a file with SHA-256 deduplication
   */
  public async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string,
    mineId?: string,
    companyId?: string,
  ): Promise<StoredFileResult> {
    const fileSize = fileBuffer.length;
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Check for existing deduplicated file
    const existing = await this.prisma.attachment.findFirst({
      where: { fileHash },
    });

    if (existing) {
      this.logger.log(`File ${originalName} matches existing hash ${fileHash}. Reusing storage key.`);
      return {
        attachmentId: existing.id,
        fileName: existing.fileName,
        fileSize: existing.fileSize,
        mimeType: existing.mimeType,
        fileHash: existing.fileHash,
        storageKey: existing.storageKey,
        url: `/api/v1/storage/files/${existing.storageKey}`,
      };
    }

    const ext = path.extname(originalName) || '.bin';
    const storageKey = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(this.localStorageDir, storageKey);

    // Save file to local/MinIO volume
    await fs.promises.writeFile(filePath, fileBuffer);

    // Record Attachment metadata in DB
    const attachment = await this.prisma.attachment.create({
      data: {
        fileName: originalName,
        fileSize,
        mimeType,
        fileHash,
        storageKey,
        uploadedById: userId,
        mineId: mineId || null,
        companyId: companyId || null,
      },
    });

    this.logger.log(`Successfully stored attachment ${attachment.id} (${originalName}, ${fileSize} bytes)`);

    return {
      attachmentId: attachment.id,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      fileHash: attachment.fileHash,
      storageKey: attachment.storageKey,
      url: `/api/v1/storage/files/${storageKey}`,
    };
  }

  /**
   * Retrieve file path on disk
   */
  public getFilePath(storageKey: string): string {
    const safeKey = path.basename(storageKey);
    const filePath = path.join(this.localStorageDir, safeKey);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found on storage volume');
    }
    return filePath;
  }
}
