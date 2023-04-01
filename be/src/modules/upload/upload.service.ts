/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-var-requires */
import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorMessage } from 'enum/error';
import type { Response } from 'express';
import e from 'express';

import {
  getBytes,
  getDownloadURL,
  getMetadata,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { join } from 'path';
import { storage } from 'src/config/firebase.config';
import * as fs from 'fs';
import * as archiver from 'archiver';
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
  async uploadFireBase(files: Array<Express.Multer.File>) {
    const data = [];
    // const pdf = files.filter((el) => el.mimetype == 'application/pdf');
    // if (pdf.length > 10) {
    //   throw new HttpException(
    //     ErrorMessage.FILE_PDF_MAX,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    for (const file of files) {
      const fileUpload = await this.save(file);

      // const fileUpload = files
      //   .replace(
      //     'https://firebasestorage.googleapis.com/v0/b/uploadfb-6dc7e.appspot.com/o/files%2F',
      //     '',
      //   )
      //   .split('?')[0];

      data.push({
        file_url: fileUpload,
        size: file.size,
      });
    }
    return data;
  }

  async save(file: Express.Multer.File) {
    try {
      const imageRef = ref(storage, `files/${file.originalname}`);
      const snapshot = await uploadBytes(imageRef, file.buffer);
      const url = await getDownloadURL(snapshot.ref);

      console.log(url);
      return url;

      // console.log(bucket);

      // const storage = getStorage();
      // console.log(storage);
      // const storageRef = ref(storage, `files/${file.originalname}`);

      // const snapshot = await uploadBytesResumable(storageRef, file.buffer);

      // const downloadURL = await getDownloadURL(snapshot.ref);
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
