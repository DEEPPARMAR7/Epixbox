const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

/**
 * Generate TOTP secret and QR code
 * @param {string} email - User email
 * @param {string} appName - App name for QR code
 * @returns {Promise<{secret, qrCode}>}
 */
async function generateSecret(email, appName = 'EpixBox') {
  try {
    const secret = speakeasy.generateSecret({
      name: `${appName} (${email})`,
      issuer: appName,
      length: 32,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
      qrCode, // Data URL for display
    };
  } catch (error) {
    logger.error('Failed to generate 2FA secret:', error);
    throw error;
  }
}

/**
 * Verify TOTP token
 * @param {string} secret - User's TOTP secret
 * @param {string} token - 6-digit token from authenticator
 * @returns {boolean}
 */
function verifyToken(secret, token) {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow for time skew
    });
  } catch (error) {
    logger.error('Token verification failed:', error);
    return false;
  }
}

/**
 * Generate backup codes (10 codes, hashed)
 * @returns {Promise<{codes: string[], hashedCodes: string[]}>}
 */
async function generateBackupCodes() {
  const codes = [];
  const hashedCodes = [];

  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
    const hashedCode = await bcrypt.hash(code, 10);
    hashedCodes.push(hashedCode);
  }

  return { codes, hashedCodes };
}

/**
 * Verify backup code
 * @param {string} code - Backup code to verify
 * @param {array} hashedCodes - Array of hashed backup codes from DB
 * @returns {Promise<{valid: boolean, index: number}>}
 */
async function verifyBackupCode(code, hashedCodes) {
  try {
    for (let i = 0; i < hashedCodes.length; i++) {
      const isMatch = await bcrypt.compare(code, hashedCodes[i]);
      if (isMatch) {
        return { valid: true, index: i };
      }
    }
    return { valid: false, index: -1 };
  } catch (error) {
    logger.error('Backup code verification failed:', error);
    return { valid: false, index: -1 };
  }
}

/**
 * Remove a backup code from the list (after use)
 * @param {array} hashedCodes - Array of hashed codes
 * @param {number} indexToRemove - Index of code to remove
 * @returns {array} - Updated array without the used code
 */
function removeUsedBackupCode(hashedCodes, indexToRemove) {
  return hashedCodes.filter((_, idx) => idx !== indexToRemove);
}

module.exports = {
  generateSecret,
  verifyToken,
  generateBackupCodes,
  verifyBackupCode,
  removeUsedBackupCode,
};
