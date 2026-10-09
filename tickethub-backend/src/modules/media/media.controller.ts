import type { Request, Response, NextFunction } from 'express';

import { uploadImage } from './media.service.js';

function isSupportedImage(file: Express.Multer.File) {
  const bytes = file.buffer;
  if (bytes.length < 12) return false;

  const isPng = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isGif = bytes.subarray(0, 6).toString('ascii') === 'GIF87a' || bytes.subarray(0, 6).toString('ascii') === 'GIF89a';
  const isWebp = bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';

  return isPng || isJpeg || isGif || isWebp;
}

function normalizeFolder(value: unknown) {
  const folder = typeof value === 'string' ? value : 'events';
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\/+/g, '/');
  return safeFolder || 'events';
}

export async function uploadMedia(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,

        message: 'No files uploaded',
      });

      return;
    }

    if (files.some((file) => !isSupportedImage(file))) {
      res.status(400).json({
        success: false,
        message: 'Only PNG, JPEG, GIF, or WEBP images are allowed',
      });
      return;
    }

    const folder = normalizeFolder(req.body.folder);

    const uploads = await Promise.all(
      files.map((file) =>
        uploadImage({
          folder: `tickethub/${folder}`,

          file,
        }),
      ),
    );

    res.status(200).json({
      success: true,

      data: uploads.map((image) => ({
        url: image.url,

        publicId: image.publicId,
      })),
    });
  } catch (error) {
    next(error);
  }
}
