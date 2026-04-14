function normalizeRole(role) {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'admin' || normalized === 'photographer' || normalized === 'client') {
    return normalized;
  }
  return 'photographer';
}

function getAdminEmails() {
  return String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

function getOwnerEmails() {
  const ownerEmails = String(process.env.OWNER_EMAILS || process.env.OWNER_EMAIL || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  return ownerEmails;
}

function resolveUserRole(user) {
  if (!user) return 'client';

  const ownerEmails = getOwnerEmails();
  if (ownerEmails.includes(String(user.email || '').toLowerCase())) {
    return 'admin';
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.includes(String(user.email || '').toLowerCase())) {
    return 'admin';
  }

  return normalizeRole(user.role);
}

module.exports = {
  normalizeRole,
  getOwnerEmails,
  resolveUserRole,
};
