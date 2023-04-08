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
  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFileToFireBase(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.uploadService.uploadFileToFireBase(files);
  }

  @Public()
  @Post('images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImageFireBase(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.uploadService.uploadImageFireBase(files);
  }

  @Public()
  @Get('files')
  async downloadIdeasFiles(
    @UserData() userData: IUserData,
    // @Res() res: Response,
  ) {
    return await this.uploadService.downloadIdeasFiles(userData);
  }
}
