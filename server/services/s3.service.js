const { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');

const BUCKET = process.env.S3_BUCKET_NAME || 'epicbox1';
const CF_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

/**
 * Returns a publicly accessible URL for an S3 key.
 * Uses CloudFront if CLOUDFRONT_DOMAIN is set, otherwise the S3 public URL.
 */
function getPublicUrl(key) {
  if (!key) return null;
  const safeKey = String(key)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  if (CF_DOMAIN) return `https://${CF_DOMAIN}/${safeKey}`;
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${BUCKET}.s3.${region}.amazonaws.com/${safeKey}`;
}

async function deleteFile(key) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

async function getSignedDownloadUrl(key, expiresIn = 3600, filename = null, contentType = null) {
  const commandInput = { Bucket: BUCKET, Key: key };
  if (filename) {
    const safeFilename = String(filename).replace(/"/g, '');
    commandInput.ResponseContentDisposition = `attachment; filename="${safeFilename}"`;
  }
  if (contentType) {
    commandInput.ResponseContentType = contentType;
  }

  return getSignedUrl(
    s3Client,
    new GetObjectCommand(commandInput),
    { expiresIn }
  );
}

async function getSignedViewUrl(key, expiresIn = 3600) {
  if (!key) return null;
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  );
}

async function getSignedUploadUrl(key, contentType, expiresIn = 300) {
  return getSignedUrl(
    s3Client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn }
  );
}

async function getObjectBuffer(key) {
  const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function putObject(key, buffer, contentType) {
  await s3Client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType })
  );
}

module.exports = { deleteFile, getSignedDownloadUrl, getSignedViewUrl, getSignedUploadUrl, getObjectBuffer, putObject, getPublicUrl };
