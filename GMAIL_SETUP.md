# Gmail SMTP Setup for EpicBox

## Email Configuration for Forgot Password & Order Notifications

Your app currently uses **Gmail SMTP** for email delivery. Here's how to set it up correctly:

---

## ✅ Option 1: Gmail App Password (Recommended)

**Best for**: Accounts with 2-Factor Authentication enabled.

### Steps:

1. **Enable 2-Factor Authentication** (if not already)
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the generated 16-character password

3. **Update `.env` file**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<16-character-app-password>
   EMAIL_FROM=your-email@gmail.com
   ```

4. **Restart server** to apply changes

---

## ⚠️ Option 2: Less Secure App Access

**For accounts without 2FA** (less secure, not recommended):

1. Go to https://myaccount.google.com/lesssecureapps
2. Toggle **"Allow less secure app access"** ON
3. Use your regular Gmail password in `.env`:
   ```
   SMTP_PASS=your-gmail-password
   ```

---

## 🧪 Testing Email Delivery

### Test via Debug Endpoint

Once configured, test with your debug key:

```bash
curl -X POST http://localhost:4000/api/debug/send-test-email \
  -H "X-Debug-Key: <YOUR_DEBUG_EMAIL_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

Replace:
- `<YOUR_DEBUG_EMAIL_API_KEY>` - Set this in `.env` (e.g., `DEBUG_EMAIL_API_KEY=your-secret-key-here`)
- `test@example.com` - Your test email address

### Test via Forgot Password UI

1. Go to `/forgot-password` on your frontend
2. Enter your email
3. Check your inbox (and spam folder) within 1 minute
4. Check server logs for detailed email status

---

## 📋 Troubleshooting

| Issue | Solution |
|-------|----------|
| **501 Authorization Failed** | Using wrong password. Use 16-char app password, not Gmail password |
| **534 Application-specific password required** | Enable 2FA and use app password |
| **Email goes to spam** | Add your domain to Gmail allowlist or use a custom domain |
| **Connection timeout** | Check firewall/VPN blocks port 587 |
| **No error but email doesn't arrive** | Check logs with debug endpoint, may be spam filter |

---

## 📝 Environment Variables Required

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-16-chars
EMAIL_FROM=your-email@gmail.com

# Debug Endpoint (for testing)
DEBUG_EMAIL_API_KEY=your-secret-debug-key
```

---

## ✅ Verification Checklist

- [ ] App password generated from Google Account
- [ ] `.env` file updated with SMTP credentials
- [ ] Server restarted
- [ ] Test email sent via debug endpoint
- [ ] Email received in inbox (check spam folder)
- [ ] Forgot password test completed

Once verified, your password reset emails will work! 🎉
