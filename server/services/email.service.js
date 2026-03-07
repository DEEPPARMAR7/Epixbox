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

module.exports = { sendProofingInvite, sendOrderConfirmation };
