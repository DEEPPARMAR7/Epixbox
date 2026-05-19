const transporter = require('../config/email');
const logger = require('../config/logger');

async function sendProofingInvite({ to, clientName, photographerName, shareLink, message }) {
  try {
    const result = await transporter.sendMail({
      from: `"${photographerName}" <${process.env.EMAIL_FROM || 'noreply@photoflow.app'}>`,
      to,
      subject: `${photographerName} has shared photos for your review`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${clientName},</h2>
          <p>${message || 'Your photographer has shared a gallery with you for review.'}</p>
          <p>Click the button below to view and select your favorite photos:</p>
          <a href="${shareLink}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            View Photos
          </a>
          <p style="color:#888;font-size:12px;margin-top:24px;">
            If the button doesn't work, copy this link: ${shareLink}
          </p>
        </div>
      `,
    });
    logger.info('✓ Proofing invite email sent', { to, messageId: result.messageId });
  } catch (err) {
    logger.error('✗ Failed to send proofing invite email', { to, error: err.message });
    throw err;
  }
}

async function sendOrderConfirmation({ to, order }) {
  try {
    const result = await transporter.sendMail({
      from: `"PhotoFlow" <${process.env.EMAIL_FROM || 'noreply@photoflow.app'}>`,
      to,
      subject: `Order Confirmation #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your order!</h2>
          <p>Order ID: <strong>${order.id}</strong></p>
          <p>Total: <strong>$${((order.total_cents || 0) / 100).toFixed(2)}</strong></p>
          <p>Status: ${order.status}</p>
          <p>We'll notify you when your order ships.</p>
        </div>
      `,
    });
    logger.info('✓ Order confirmation email sent', { to, messageId: result.messageId });
  } catch (err) {
    logger.error('✗ Failed to send order confirmation email', { to, error: err.message });
    throw err;
  }
}

async function sendPasswordResetEmail({ to, resetLink }) {
  if (!resetLink) {
    logger.warn('WARNING: sendPasswordResetEmail called with empty resetLink!', { to });
    throw new Error('Reset link is required');
  }

  try {
    logger.info('Attempting to send password reset email', {
      to,
      resetLinkLength: resetLink.length,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      from: process.env.EMAIL_FROM,
    });

    const result = await transporter.sendMail({
      from: `"EpicBox" <${process.env.EMAIL_FROM || 'noreply@epicbox.app'}>`,
      to,
      subject: 'Reset your EpicBox password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #0f172a;">Reset your password</h2>
            <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">
              We received a request to reset your EpicBox account password. Click the button below to create a new password. This link expires in 30 minutes.
            </p>
            <div style="margin: 0 0 32px;">
              <a href="${resetLink}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                Reset Password
              </a>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
              <p style="margin: 0 0 16px; font-size: 13px; color: #64748b;">If the button doesn't work, copy this link:</p>
              <p style="margin: 0; font-size: 12px; color: #0f172a; word-break: break-all; background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace;">${resetLink}</p>
            </div>
            <p style="margin: 32px 0 0; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 24px;">
              If you didn't request this, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8; text-align: center;">
            © 2026 EpicBox. All rights reserved.
          </p>
        </div>
      `,
    });

    logger.info('✅ Password reset email sent successfully', {
      to,
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
    });
  } catch (err) {
    logger.error('❌ Failed to send password reset email', {
      to,
      error: err.message,
      code: err.code,
      command: err.command,
      responseCode: err.responseCode,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      from: process.env.EMAIL_FROM,
      troubleshoot: `Gmail: Use App Password, not regular password. Check "Less secure app access" or enable 2FA and use app password. If SMTP_PASS contains special chars, URL-encode them.`,
    });
    throw err;
  }
}

async function sendUploadCompleteEmail({ to, galleryTitle, uploadedCount }) {
  if (!to) return;

  await transporter.sendMail({
    from: `"EpicBox" <${process.env.EMAIL_FROM || 'noreply@epicbox.app'}>`,
    to,
    subject: `Upload complete: ${uploadedCount} file${uploadedCount === 1 ? '' : 's'} processed`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Upload complete</h2>
        <p style="margin: 0 0 16px; color: #334155;">
          Your upload for <strong>${galleryTitle || 'your gallery'}</strong> is complete.
        </p>
        <p style="margin: 0 0 10px; color: #334155;">
          Processed files: <strong>${uploadedCount}</strong>
        </p>
      </div>
    `,
  });
}

async function sendSubscriptionWelcomeEmail({ to, planName, trialDays, manageUrl }) {
  if (!to) return;

  await transporter.sendMail({
    from: `"EpicBox" <${process.env.EMAIL_FROM || 'noreply@epicbox.app'}>`,
    to,
    subject: `Welcome to ${planName} subscription`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Subscription confirmed</h2>
        <p style="margin: 0 0 16px; color: #334155;">
          You're now subscribed to <strong>${planName}</strong>.
        </p>
        ${trialDays > 0 ? `<p style="margin: 0 0 16px; color: #334155;">Your free trial ends in <strong>${trialDays} day${trialDays > 1 ? 's' : ''}</strong>.</p>` : ''}
        <p style="margin: 0 0 20px;">
          <a href="${manageUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;">
            Manage subscription
          </a>
        </p>
      </div>
    `,
  });
}

async function sendTrialEndingReminderEmail({ to, planName, manageUrl }) {
  if (!to) return;

  await transporter.sendMail({
    from: `"EpicBox" <${process.env.EMAIL_FROM || 'noreply@epicbox.app'}>`,
    to,
    subject: `Your ${planName} trial is ending soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Trial reminder</h2>
        <p style="margin: 0 0 16px; color: #334155;">
          Your <strong>${planName}</strong> trial will end soon. Keep your access uninterrupted by reviewing your billing details.
        </p>
        <p style="margin: 0 0 20px;">
          <a href="${manageUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;">
            Review subscription
          </a>
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendProofingInvite,
  sendOrderConfirmation,
  sendPasswordResetEmail,
  sendUploadCompleteEmail,
  sendSubscriptionWelcomeEmail,
  sendTrialEndingReminderEmail,
};
