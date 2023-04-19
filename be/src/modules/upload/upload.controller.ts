import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFileToFireBase(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.uploadService.uploadFileToFireBase(files);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImageFireBase(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.uploadService.uploadImageFireBase(files);
  }
}
