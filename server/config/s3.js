const { S3Client } = require('@aws-sdk/client-s3');

const config = {
  region: process.env.AWS_REGION || 'us-east-1',
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(config);

module.exports = s3Client;
