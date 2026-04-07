const sharp = require('sharp');
const { getObjectBuffer, putObject } = require('./s3.service');

function buildWatermarkSvg(text) {
  const safeText = String(text || 'EpixBox').replace(/[<>]/g, '');
  return Buffer.from(`
    <svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm { fill: rgba(255,255,255,0.45); font-size: 46px; font-family: Arial, sans-serif; font-weight: bold; }
      </style>
      <text x="98%" y="94%" text-anchor="end" class="wm">${safeText}</text>
    </svg>
  `);
}

async function processUploadedPhoto(s3KeyOriginal, userId, galleryId, photoId) {
  const buffer = await getObjectBuffer(s3KeyOriginal);
  const jpegQuality = Number(process.env.IMAGE_JPEG_QUALITY || 82);
  const watermarkEnabled = String(process.env.WATERMARK_ENABLED || 'false').toLowerCase() === 'true';
  const watermarkText = process.env.WATERMARK_TEXT || 'EpixBox';

  const sizes = [
    { suffix: 'large', key: `${userId}/${galleryId}/${photoId}/large.jpg`, width: 2048 },
    { suffix: 'medium', key: `${userId}/${galleryId}/${photoId}/medium.jpg`, width: 1024 },
    { suffix: 'thumb', key: `${userId}/${galleryId}/${photoId}/thumb.jpg`, width: 300 },
  ];

  for (const size of sizes) {
    let pipeline = sharp(buffer)
      .resize(size.width, null, { withoutEnlargement: true, fit: 'inside' });

    if (watermarkEnabled && size.suffix !== 'thumb') {
      pipeline = pipeline.composite([
        {
          input: buildWatermarkSvg(watermarkText),
          gravity: 'southeast',
        },
      ]);
    }

    const resized = await pipeline.jpeg({ quality: jpegQuality, progressive: true }).toBuffer();
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
