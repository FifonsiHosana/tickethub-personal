import type { Request, Response, NextFunction } from 'express';

import { uploadImage } from './media.service.js';

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

    const folder = req.body.folder ?? 'events';

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
