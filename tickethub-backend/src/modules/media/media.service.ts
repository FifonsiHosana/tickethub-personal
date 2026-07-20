import cloudinary from './cloudinary.config.js';

interface UploadImageOptions {
  folder: string;

  file: Express.Multer.File;
}

export async function uploadImage({
  folder,

  file,
}: UploadImageOptions) {
  return new Promise<{
    url: string;

    publicId: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,

        resource_type: 'image',
      },

      (error, result) => {
        if (error) {
          reject(error);

          return;
        }

        resolve({
          url: result!.secure_url,

          publicId: result!.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  });
}
