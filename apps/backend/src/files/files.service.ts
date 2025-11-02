import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

import { FILE_ERRORS } from './files.contsants';
import { PrismaService } from '../prisma/prisma.service';

import type { Prisma } from '@prisma/client';

@Injectable()
export class FilesService {
  private s3: S3Client;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async createPublic(file: Express.Multer.File) {
    const key = `${uuid()}-avatar.${file.originalname.split('.').pop()}`;
    const bucketName = this.configService.get('AWS_PUBLIC_BUCKET_NAME');

    const uploadResult = await this.s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Body: file.buffer,
        Key: key,
      }),
    );

    // Manually constructing the URL
    const url = `https://${bucketName}.s3.${this.configService.get(
      'AWS_REGION',
    )}.amazonaws.com/${key}`;

    const newFile = await this.prisma.publicFile.create({
      data: {
        key: key,
        url: url,
      },
    });

    return newFile;
  }

  async create(file: Express.Multer.File) {
    const { originalname, mimetype, size, buffer } = file;
    const newFile = await this.prisma.file.create({
      data: {
        filename: originalname,
        mimetype: mimetype,
        size: size,
        data: buffer,
      },
    });
    return newFile;
  }

  async createPrivate(file: Express.Multer.File, ownerId: string) {
    const key = `${uuid()}-privatefile.${file.originalname.split('.').pop()}`;
    const bucketName = this.configService.get('AWS_PRIVATE_BUCKET_NAME');

    const uploadResult = await this.s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Body: file.buffer,
        Key: key,
      }),
    );

    const newFile = await this.prisma.privateFile.create({
      data: {
        key: key,
        ownerId,
      },
    });

    return newFile;
  }

  async findAll() {
    return await this.prisma.file.findMany();
  }

  async findOne(fileWhereUniqueInput: Prisma.FileWhereUniqueInput) {
    const file = await this.prisma.file.findUnique({
      where: fileWhereUniqueInput,
    });
    if (file) {
      return file;
    }
    throw new HttpException(FILE_ERRORS.NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  async findOnePublic(fileWhereUniqueInput: Prisma.PublicFileWhereUniqueInput) {
    const file = await this.prisma.publicFile.findUnique({
      where: fileWhereUniqueInput,
    });
    if (file) {
      return file;
    }
    throw new HttpException(FILE_ERRORS.NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  async remove(where: Prisma.FileWhereUniqueInput) {
    await this.findOne(where);
    await this.prisma.file.delete({
      where,
    });
  }

  async removePublic(where: Prisma.PublicFileWhereUniqueInput) {
    const publicFile = await this.findOnePublic(where);

    const params = {
      Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
      Key: publicFile.key,
    };

    try {
      await this.s3.send(new HeadObjectCommand(params));
      console.log('File Found in S3');
      try {
        await this.s3.send(new DeleteObjectCommand(params));
      } catch (err) {
        throw new HttpException(
          FILE_ERRORS.ERROR_DELETING,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw new HttpException(FILE_ERRORS.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.prisma.publicFile.delete({
      where,
    });
  }
}
