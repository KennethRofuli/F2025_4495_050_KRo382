const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail, generateResetToken } = require('../config/mailer');
const crypto = require('crypto');

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map();

/**
 * Initiate password reset - send email with reset link
 */
const initiatePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }
    
    // Generate reset token
    const resetToken = generateResetToken();
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Store token temporarily
    resetTokens.set(resetToken, {
      email: email.toLowerCase(),
      expiry: tokenExpiry,
      used: false
    });
    
    // Send email
    const emailResult = await sendPasswordResetEmail(email.toLowerCase(), resetToken);
    
    if (emailResult.success) {
      console.log(`📧 Password reset email sent to: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send reset email. Please try again.'
      });
    }
    
  } catch (error) {
    console.error('Initiate password reset error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during password reset initiation'
    });
  }
};

/**
 * Legacy: Verify user exists for password reset (POST endpoint)
 */
const verifyResetTokenLegacy = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists in our system
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User verified for password reset',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Verify reset token legacy error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during token verification'
    });
  }
};

/**
 * Verify reset token and show reset form (GET endpoint from email)
 */
const verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.query;
    
    if (!token || !email) {
      return res.status(400).send(`
        <html><body>
        <h2>Invalid Reset Link</h2>
        <p>The password reset link is invalid or missing required parameters.</p>
        <button class="close-btn" onclick="window.close()">Close Tab</button>
        </body></html>
      `);
    }
    
    // Check if token exists and is valid
    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).send(`
        <html><body>
        <h2>Invalid Reset Link</h2>
        <p>The password reset link is invalid or has expired.</p>
        <button onclick="window.close()">Close Tab</button>
        </body></html>
      `);
    }
    
    if (tokenData.used) {
      return res.status(400).send(`
        <html><body>
        <h2>Reset Link Already Used</h2>
        <p>This password reset link has already been used.</p>
        <button onclick="window.close()">Close Tab</button>
        </body></html>
      `);
    }
    
    if (new Date() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).send(`
        <html><body>
        <h2>Reset Link Expired</h2>
        <p>The password reset link has expired. Please request a new one.</p>
        <button onclick="window.close()">Close Tab</button>
        </body></html>
      `);
    }
    
    if (tokenData.email !== email.toLowerCase()) {
      return res.status(400).send(`
        <html><body>
        <h2>Invalid Reset Link</h2>
        <p>The password reset link does not match the provided email.</p>
        <button onclick="window.close()">Close Tab</button>
        </body></html>
      `);
    }
    
    // Show password reset form
    return res.send(`
      <html>
      <head>
        <title>Reset Password - Student Marketplace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
          .form-group { margin-bottom: 15px; }
          label { display: block; margin-bottom: 5px; font-weight: bold; }
          input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          button { background: #007AFF; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
          button:hover { background: #0056CC; }
          .close-btn { background: #666; margin-top: 20px; }
          .close-btn:hover { background: #444; }
          .error { color: red; margin-top: 10px; }
          .success { color: green; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h2>Reset Your Password</h2>
        <p>Enter your new password for <strong>${email}</strong></p>
        <form id="resetForm">
          <div class="form-group">
            <label for="password">New Password:</label>
            <input type="password" id="password" name="password" required minlength="6">
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
          </div>
          <button type="submit">Reset Password</button>
        </form>
        <div id="message"></div>
        
        <script>
          document.getElementById('resetForm').onsubmit = async function(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageDiv = document.getElementById('message');
            
            if (password !== confirmPassword) {
              messageDiv.innerHTML = '<div class="error">Passwords do not match!</div>';
              return;
            }
            
            if (password.length < 6) {
              messageDiv.innerHTML = '<div class="error">Password must be at least 6 characters long!</div>';
              return;
            }
            
            try {
              const response = await fetch('/api/password-reset/complete-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', email: '${email}', newPassword: password })
              });
              
              const result = await response.json();
              
              if (result.success) {
                messageDiv.innerHTML = '<div class="success">Password reset successful! You can now login with your new password in the app.<br><br><button class="close-btn" onclick="window.close()">Close Tab</button></div>';
                document.getElementById('resetForm').style.display = 'none';
                setTimeout(() => { 
                  try { 
                    window.close(); 
                  } catch (e) { 
                    // If auto-close fails, the manual button is available
                  }
                }, 2000);
              } else {
                messageDiv.innerHTML = '<div class="error">' + (result.error || 'Password reset failed') + '</div>';
              }
            } catch (error) {
              messageDiv.innerHTML = '<div class="error">Network error. Please try again.</div>';
            }
          };
        </script>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Verify reset token error:', error);
    return res.status(500).send(`
      <html><body>
      <h2>Server Error</h2>
      <p>An error occurred while processing your request.</p>
      <button onclick="window.close()">Close Tab</button>
      </body></html>
    `);
  }
};

// Auto-sync function removed - no longer needed without Firebase

// Firebase sync function removed - no longer needed

/**
 * Complete password reset using token
 */
const completePasswordReset = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    
    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token, email, and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if token exists and is valid
    const tokenData = resetTokens.get(token);
    
    if (!tokenData || tokenData.used || new Date() > tokenData.expiry || tokenData.email !== email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.needsPasswordChange = false;
    await user.save();
    
    // Mark token as used
    tokenData.used = true;
    
    console.log(`✅ Password reset completed for: ${email}`);
    
    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
    
  } catch (error) {
    console.error('Complete password reset error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during password reset completion'
    });
  }
};

/**
 * Legacy password reset function (for existing functionality)
 */
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, new password, and confirmation are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Find user in our system
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update password in our system (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password reset successful for user: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during password reset'
    });
  }
};

/**
 * Debug endpoint to check user and Firebase status
 */
const debugUserStatus = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Check user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    const userExists = !!user;
    
    // Firebase removed - no longer needed
    return res.status(200).json({
      success: true,
      debug: {
        email: email.toLowerCase(),
        mongodbUserExists: userExists,
        hasNeedsPasswordChange: user ? user.needsPasswordChange : false,
        userCreatedAt: user ? user.createdAt : null
      }
    });
  } catch (error) {
    console.error('Debug user status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during debug check'
    });
  }
};

// Firebase status check removed - no longer needed

/**
 * Complete password reset process - bypasses Firebase and directly resets in MongoDB
 * Use this when Firebase reset breaks the authentication
 */
const emergencyPasswordReset = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, new password, and confirmation are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update password in MongoDB (will be hashed by pre-save hook)
    user.password = newPassword;
    user.lastPasswordSync = new Date();
    await user.save();

    // Firebase sync removed - only updating MongoDB now

    console.log(`🚨 Emergency password reset completed for: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Emergency password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Emergency password reset error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during emergency password reset'
    });
  }
};



/**
 * Manual sync - forces a password sync by prompting user to re-enter their current password
 * This will sync the provided password to MongoDB (assumes it's correct since user entered it)
 */
const manualSync = async (req, res) => {
  try {
    const { email, currentPassword } = req.body;

    if (!email || !currentPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email and current password are required'
      });
    }

    if (currentPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Find user in our system
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update password in our system (will be hashed by pre-save hook)
    user.password = currentPassword;
    user.lastPasswordSync = new Date();
    await user.save();

    console.log(`✅ Manual password sync successful for: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Password synchronized successfully. You can now login with this password.'
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during manual sync'
    });
  }
};

module.exports = {
  initiatePasswordReset,
  verifyResetToken,
  verifyResetTokenLegacy,
  completePasswordReset,
  resetPassword,
  debugUserStatus,
  manualSync,
  emergencyPasswordReset
};