const sharp = require('sharp');
const { WatermarkTemplate } = require('../models');
const { getObjectBuffer, getPublicUrl } = require('./s3.service');
const logger = require('../config/logger');

/**
 * Apply watermark to a photo
 * @param {string} photoS3Key - S3 key of the photo to watermark
 * @param {string} watermarkId - ID of watermark template
 * @returns {Promise<string>} - S3 key of watermarked photo
 */
async function applyWatermark(photoS3Key, watermarkId) {
  try {
    const watermark = await WatermarkTemplate.findByPk(watermarkId);
    if (!watermark) throw new Error('Watermark template not found');

    // Get original photo buffer
    const photoBuffer = await getObjectBuffer(photoS3Key);
    let image = sharp(photoBuffer);

    // Get image metadata to calculate positions and sizes
    const metadata = await image.metadata();
    const { width, height } = metadata;

    let watermarkedImage = image;

    if (watermark.is_text_watermark) {
      watermarkedImage = await applyTextWatermark(
        watermarkedImage,
        watermark,
        width,
        height
      );
    } else if (watermark.image_url_s3) {
      watermarkedImage = await applyImageWatermark(
        watermarkedImage,
        watermark,
        width,
        height
      );
    }

    // Generate new S3 key for watermarked photo
    const newS3Key = photoS3Key.replace(/\.[^.]+$/, `-watermarked-${Date.now()}.jpg`);

    // Convert to buffer and upload
    const watermarkedBuffer = await watermarkedImage.jpeg({ quality: 95 }).toBuffer();
    await require('../services/s3.service').putObject(newS3Key, watermarkedBuffer, 'image/jpeg');

    logger.info(`Watermark applied: ${photoS3Key} -> ${newS3Key}`);
    return newS3Key;
  } catch (error) {
    logger.error('Watermark application failed:', error);
    throw error;
  }
}

/**
 * Apply text watermark to image
 */
async function applyTextWatermark(image, watermark, imageWidth, imageHeight) {
  const fontSize = Math.max(20, Math.floor(imageWidth * 0.02)); // 2% of width
  const watermarkWidth = Math.floor(imageWidth * (watermark.size_percentage / 100));

  // Create SVG for text watermark with rotation
  const svg = Buffer.from(`
    <svg width="${imageWidth}" height="${imageHeight}">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.5"/>
        </filter>
      </defs>
      <g opacity="${watermark.opacity}">
        <text x="${getXPosition(watermark.position, imageWidth, watermarkWidth)}"
              y="${getYPosition(watermark.position, imageHeight, fontSize)}"
              font-family="${watermark.font_family}"
              font-size="${fontSize}"
              fill="${watermark.color}"
              transform="rotate(${watermark.rotation} ${imageWidth/2} ${imageHeight/2})"
              filter="url(#shadow)">
          ${watermark.text}
        </text>
      </g>
    </svg>
  `);

  return image.composite([{ input: svg, blend: 'over' }]);
}

/**
 * Apply image watermark
 */
async function applyImageWatermark(image, watermark, imageWidth, imageHeight) {
  try {
    const watermarkImageBuffer = await getObjectBuffer(watermark.image_url_s3);
    const watermarkSize = Math.floor(imageWidth * (watermark.size_percentage / 100));

    const resizedWatermark = await sharp(watermarkImageBuffer)
      .resize(watermarkSize, watermarkSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const { left, top } = getCompositePosition(watermark.position, imageWidth, imageHeight, watermarkSize);

    return image.composite([
      {
        input: resizedWatermark,
        left,
        top,
        blend: 'over',
        opacity: watermark.opacity,
      },
    ]);
  } catch (error) {
    logger.error('Image watermark application failed:', error);
    throw error;
  }
}

/**
 * Calculate X position based on watermark position
 */
function getXPosition(position, imageWidth, watermarkWidth) {
  const positions = {
    'top-left': 20,
    'top-center': (imageWidth - watermarkWidth) / 2,
    'top-right': imageWidth - watermarkWidth - 20,
    'center-left': 20,
    'center': (imageWidth - watermarkWidth) / 2,
    'center-right': imageWidth - watermarkWidth - 20,
    'bottom-left': 20,
    'bottom-center': (imageWidth - watermarkWidth) / 2,
    'bottom-right': imageWidth - watermarkWidth - 20,
  };
  return positions[position] || (imageWidth - watermarkWidth - 20);
}

/**
 * Calculate Y position based on watermark position
 */
function getYPosition(position, imageHeight, fontSize) {
  const margin = fontSize + 10;
  const positions = {
    'top-left': margin,
    'top-center': margin,
    'top-right': margin,
    'center-left': imageHeight / 2,
    'center': imageHeight / 2,
    'center-right': imageHeight / 2,
    'bottom-left': imageHeight - margin,
    'bottom-center': imageHeight - margin,
    'bottom-right': imageHeight - margin,
  };
  return positions[position] || (imageHeight - margin);
}

/**
 * Calculate composite position for image watermarks
 */
function getCompositePosition(position, imageWidth, imageHeight, watermarkSize) {
  const margin = 20;
  const positions = {
    'top-left': { left: margin, top: margin },
    'top-center': { left: (imageWidth - watermarkSize) / 2, top: margin },
    'top-right': { left: imageWidth - watermarkSize - margin, top: margin },
    'center-left': { left: margin, top: (imageHeight - watermarkSize) / 2 },
    'center': { left: (imageWidth - watermarkSize) / 2, top: (imageHeight - watermarkSize) / 2 },
    'center-right': { left: imageWidth - watermarkSize - margin, top: (imageHeight - watermarkSize) / 2 },
    'bottom-left': { left: margin, top: imageHeight - watermarkSize - margin },
    'bottom-center': { left: (imageWidth - watermarkSize) / 2, top: imageHeight - watermarkSize - margin },
    'bottom-right': { left: imageWidth - watermarkSize - margin, top: imageHeight - watermarkSize - margin },
  };
  return positions[position] || { left: imageWidth - watermarkSize - margin, top: imageHeight - watermarkSize - margin };
}

module.exports = {
  applyWatermark,
  applyTextWatermark,
  applyImageWatermark,
};
