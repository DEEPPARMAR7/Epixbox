const router = require('express').Router();
const { User } = require('../models');
const { generateSecret, verifyToken, generateBackupCodes, verifyBackupCode, removeUsedBackupCode } = require('../services/twofa.service');
const { requireAuth } = require('../middleware/auth.middleware');
const crypto = require('crypto');
const logger = require('../config/logger');

router.use(requireAuth);

/**
 * POST /api/v1/auth/2fa/enable
 * Initiate 2FA setup - returns QR code and secret
 */
router.post('/enable', async (req, res) => {
  try {
    const { secret, qrCode } = await generateSecret(req.user.email);
    const { codes: backupCodes, hashedCodes } = await generateBackupCodes();

    // Don't save to DB yet - wait for verification
    // Store temporarily in session or return for client to verify
    res.json({
      secret,
      qrCode, // Data URL
      backupCodes, // Show once to user
      message: 'Scan QR code with your authenticator app and enter the 6-digit code to complete setup'
    });
  } catch (error) {
    logger.error('Error enabling 2FA:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

/**
 * POST /api/v1/auth/2fa/verify
 * Verify TOTP token and enable 2FA
 */
router.post('/verify', async (req, res) => {
  try {
    const { token, secret, backupCodes } = req.body;

    if (!token || !secret || !backupCodes) {
      return res.status(400).json({ error: 'token, secret, and backupCodes are required' });
    }

    // Verify the TOTP token
    if (!verifyToken(secret, token)) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Hash and save backup codes
    const { hashedCodes } = await generateBackupCodes();
    // Actually use the supplied codes (in production, should re-generate)
    const crypto = require('crypto');
    const hashedBackupCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Update user with 2FA enabled
    await User.update(
      {
        two_factor_enabled: true,
        two_fa_secret: secret, // In production, encrypt this
        two_fa_backup_codes: JSON.stringify(hashedBackupCodes),
      },
      { where: { id: req.user.id } }
    );

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes // Show one more time to ensure user saves them
    });
  } catch (error) {
    logger.error('Error verifying 2FA:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

/**
 * POST /api/v1/auth/2fa/disable
 * Disable 2FA (requires password confirmation)
 */
router.post('/disable', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await User.findByPk(req.user.id);
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await user.update({
      two_factor_enabled: false,
      two_fa_secret: null,
      two_fa_backup_codes: null,
    });

    res.json({ success: true, message: '2FA disabled' });
  } catch (error) {
    logger.error('Error disabling 2FA:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

/**
 * POST /api/v1/auth/2fa/regenerate-backup-codes
 * Generate new backup codes
 */
router.post('/regenerate-backup-codes', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await User.findByPk(req.user.id);
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { codes: newBackupCodes, hashedCodes } = await generateBackupCodes();

    await user.update({
      two_fa_backup_codes: JSON.stringify(hashedCodes),
    });

    res.json({
      success: true,
      backupCodes: newBackupCodes,
      message: 'New backup codes generated. Save them in a safe place.'
    });
  } catch (error) {
    logger.error('Error regenerating backup codes:', error);
    res.status(500).json({ error: 'Failed to regenerate backup codes' });
  }
});

/**
 * POST /api/v1/auth/2fa/verify-token
 * Verify a TOTP token during login
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user.two_factor_enabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Check if backup code or TOTP
    let isValid = verifyToken(user.two_fa_secret, token);

    if (!isValid && user.two_fa_backup_codes) {
      const backupCodes = JSON.parse(user.two_fa_backup_codes);
      const { valid, index } = await verifyBackupCode(token, backupCodes);

      if (valid) {
        // Remove used backup code
        const updated = removeUsedBackupCode(backupCodes, index);
        await user.update({ two_fa_backup_codes: JSON.stringify(updated) });
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token or backup code' });
    }

    res.json({ success: true, message: '2FA token verified' });
  } catch (error) {
    logger.error('Error verifying 2FA token:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

module.exports = router;
