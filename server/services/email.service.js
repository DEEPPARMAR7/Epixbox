const transporter = require('../config/email');

async function sendProofingInvite({ to, clientName, photographerName, shareLink, message }) {
  await transporter.sendMail({
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
}

async function sendOrderConfirmation({ to, order }) {
  await transporter.sendMail({
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
}

async function sendPasswordResetEmail({ to, resetLink }) {
  if (!resetLink) {
    console.warn('WARNING: sendPasswordResetEmail called with empty resetLink!', { to });
  }
  
  console.log('Sending password reset email:', {
    to,
    hasResetLink: !!resetLink,
    resetLinkLength: resetLink?.length || 0,
  });
  
  await transporter.sendMail({
    from: `"EpicBox" <${process.env.EMAIL_FROM || 'noreply@epicbox.app'}>`,
    to,
    subject: 'Reset your EpicBox password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Reset your password</h2>
        <p style="margin: 0 0 16px; color: #334155;">We received a request to reset your EpicBox account password.</p>
        <p style="margin: 0 0 20px;">
          <a href="${resetLink}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;">
            Set new password
          </a>
        </p>
        <p style="font-size: 13px; color: #64748b;">This link expires in 1 hour.</p>
        <p style="font-size: 13px; color: #64748b;">If the button does not work, copy this URL into your browser:</p>
        <p style="font-size: 12px; color: #0f172a; word-break: break-all;">${resetLink}</p>
      </div>
    `,
  });
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
