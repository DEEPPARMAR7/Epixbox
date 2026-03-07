const sharp = require('sharp');
const { getObjectBuffer, putObject } = require('./s3.service');

async function processUploadedPhoto(s3KeyOriginal, userId, galleryId, photoId) {
  const buffer = await getObjectBuffer(s3KeyOriginal);

  const sizes = [
    { suffix: 'large', key: `${userId}/${galleryId}/${photoId}/large.jpg`, width: 2048 },
    { suffix: 'medium', key: `${userId}/${galleryId}/${photoId}/medium.jpg`, width: 1024 },
    { suffix: 'thumb', key: `${userId}/${galleryId}/${photoId}/thumb.jpg`, width: 300 },
  ];

  for (const size of sizes) {
    const resized = await sharp(buffer)
      .resize(size.width, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    await putObject(size.key, resized, 'image/jpeg');
  }

  // Get original dimensions
  const metadata = await sharp(buffer).metadata();

  return {
    s3KeyLarge: sizes[0].key,
    s3KeyMedium: sizes[1].key,
    s3KeyThumb: sizes[2].key,
    width: metadata.width,
    height: metadata.height,
  };
}

module.exports = { processUploadedPhoto };
