import { Public } from '@core/decorator/public.decorator';
import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { UploadService } from './upload.service';
import { UserData } from '@core/decorator/user.decorator';
import { IUserData } from '@core/interface/default.interface';
import type { Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadS3V2(@UploadedFiles() files: Array<Express.Multer.File>) {
    return await this.uploadService.uploadFireBase(files);
  }

  @Public()
  @Get('files')
  async downloadAllIdeas(
    @UserData() userData: IUserData,
    @Res() res: Response,
  ) {
    return await this.uploadService.downloadAllIdeas(res, userData);
  }
}
