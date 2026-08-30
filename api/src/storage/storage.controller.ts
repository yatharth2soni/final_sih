import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file limit
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Body('mineId') mineId?: string,
    @Body('companyId') companyId?: string,
  ) {
    if (!file) {
      return { error: 'No file provided in request.' };
    }

    const result = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      user.id,
      mineId,
      companyId,
    );

    return { data: result };
  }

  @Get('files/:storageKey')
  async getFile(@Param('storageKey') storageKey: string, @Res() res: Response) {
    try {
      const filePath = this.storageService.getFilePath(storageKey);
      return res.sendFile(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found on storage volume' });
    }
  }
}
