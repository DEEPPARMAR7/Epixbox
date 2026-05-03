import axiosClient from './axiosClient';

/**
 * Initiate 2FA setup - get QR code and temporary secret
 * @returns {Promise<{secret: string, qrCode: string, backupCodes: Array, message: string}>}
 */
export const enable2FA = () =>
  axiosClient.post('/api/auth/2fa/enable').then((r) => r.data);

/**
 * Verify TOTP token and complete 2FA setup
 * @param {string} token - 6-digit TOTP token from authenticator
 * @param {string} secret - The secret from setup step
 * @param {Array} backupCodes - Backup codes provided during setup
 * @returns {Promise<{success: boolean, message: string, backupCodes: Array}>}
 */
export const verify2FA = (token, secret, backupCodes) =>
  axiosClient.post('/api/auth/2fa/verify', { token, secret, backupCodes }).then((r) => r.data);

/**
 * Verify TOTP token during login
 * @param {string} token - TOTP token or backup code
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyToken = (token) =>
  axiosClient.post('/api/auth/2fa/verify-token', { token }).then((r) => r.data);

/**
 * Disable 2FA (requires password)
 * @param {string} password - User's password for confirmation
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const disable2FA = (password) =>
  axiosClient.post('/api/auth/2fa/disable', { password }).then((r) => r.data);

/**
 * Generate new backup codes (requires password)
 * @param {string} password - User's password for confirmation
 * @returns {Promise<{success: boolean, backupCodes: Array, message: string}>}
 */
export const regenerateBackupCodes = (password) =>
  axiosClient.post('/api/auth/2fa/regenerate-backup-codes', { password }).then((r) => r.data);
