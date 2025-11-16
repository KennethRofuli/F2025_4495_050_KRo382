const express = require('express');
const router = express.Router();
const {
  initiatePasswordReset,
  verifyResetToken,
  verifyResetTokenLegacy,
  completePasswordReset,
  resetPassword,
  debugUserStatus,
  manualSync,
  emergencyPasswordReset
} = require('../controllers/passwordResetController');

// Initiate password reset - send email
router.post('/initiate', initiatePasswordReset);

// Verify reset token and show form (GET request from email link)
router.get('/reset', verifyResetToken);

// Complete password reset (POST from form)
router.post('/complete-reset', completePasswordReset);

// Legacy endpoints
router.post('/verify-reset-token', verifyResetTokenLegacy);
router.post('/reset-password', resetPassword);

// Debug user and Firebase status
router.post('/debug-user', debugUserStatus);

// Manual password sync (for fixing sync issues)
router.post('/manual-sync', manualSync);

// Emergency password reset (when Firebase breaks auth)
router.post('/emergency-reset', emergencyPasswordReset);



module.exports = router;