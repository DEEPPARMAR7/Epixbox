const express = require('express');
const router = express.Router();

router.post('/process-payment', async (req, res) => {
  res.status(501).json({
    error: 'Google Pay payment processing is not implemented in this build.',
    message: 'Google Pay support requires server-side token handling and integration with a payment gateway.',
  });
});

module.exports = router;
