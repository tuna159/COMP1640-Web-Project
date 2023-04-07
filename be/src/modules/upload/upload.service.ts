/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-var-requires */
import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import {
  getBytes,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { join } from 'path';
import { storage } from 'src/config/firebase.config';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { ErrorMessage } from 'enum/error';
import { log } from 'console';
import { IsEmpty } from 'class-validator';
// import { initializeFireBaseApp } from 'src/config/firebase';

// const md5 = require('md5');
// const firebase = require('src/config/checkFb');

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  /**
   * Solution 1
   * @param files
   * @param folder
   * @returns
   */
  async uploadFileToFireBase(files: Array<Express.Multer.File>) {
    const data = [];

    const pdf = files.filter((el) => el.mimetype == 'application/pdf');

    if (pdf.length === 0) {
      throw new HttpException(
        ErrorMessage.YOU_CAN_CHOOSE_FILE_PDF,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (pdf) {
      for (const file of pdf) {
        const fileUpload = await this.saveFile(file);

        data.push({
          file_url: fileUpload,
          file_name: file.originalname,
          size: file.size,
        });
      }
      return data;
    }
  }

  async saveFile(file: Express.Multer.File) {
    try {
      const imageRef = ref(storage, `files/${file.originalname}`);
      const snapshot = await uploadBytes(imageRef, file.buffer);
      const url = await getDownloadURL(snapshot.ref);

      console.log(url);
      return url;
    } catch (e) {
      return e.ErrorMessage;
    }
  }

  async uploadImageFireBase(image: Array<Express.Multer.File>) {
    const data = [];
    const images = image.filter((el) => el.mimetype != 'application/pdf');

    if (images.length == 0) {
      throw new HttpException(
        ErrorMessage.YOU_CAN_CHOOSE_FILE_IMAGE,
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const image of images) {
      const imageUpload = await this.saveImage(image);
      
      data.push({
        file_url: imageUpload,
        file_name: image.originalname,
        size: image.size,
      });
      return data;
    }
  }

  async saveImage(file: Express.Multer.File) {
    try {
      const imageRef = ref(storage, `images/${file.originalname}`);
      const snapshot = await uploadBytes(imageRef, file.buffer);
      const url = await getDownloadURL(snapshot.ref);

      console.log(url);
      return url;
    } catch (e) {
      return e.ErrorMessage;
    }
  }

  async downloadAllIdeas(res: Response, userData: IUserData) {
    const listRef = ref(storage, 'files');
    const folderName = 'static';

    const a = await listAll(listRef);
    for (const ref of a.items) {
      console.log(ref);
      const a = await getMetadata(ref);
      console.log(a.name);

      const bytes = await getBytes(ref);
      const buffer = Buffer.from(bytes);
      const path = join(process.cwd(), folderName, a.name);
      console.log(path);
      fs.writeFileSync(path, buffer);
    }
    // .then((resI) => {
    // })
    // .catch((error) => {
    //   console.log(error);
    // });

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.directory(folderName, false);
    res.attachment(`${folderName}.zip`);
    archive.pipe(res);
    archive.finalize();
  }
}
