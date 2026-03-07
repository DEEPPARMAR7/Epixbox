const { ProofingSession } = require('../models/index');

module.exports = async function proofingAccess(req, res, next) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ error: 'Share token required' });
    }
    const session = await ProofingSession.findOne({ where: { share_token: token } });
    if (!session) {
      return res.status(404).json({ error: 'Proofing session not found' });
    }
    if (!session.is_active) {
      return res.status(403).json({ error: 'This proofing session is no longer active' });
    }
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return res.status(403).json({ error: 'This proofing session has expired' });
    }
    req.proofingSession = session;
    next();
  } catch (err) {
    next(err);
  }
};
