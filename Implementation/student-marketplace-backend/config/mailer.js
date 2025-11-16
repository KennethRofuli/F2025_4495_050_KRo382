const nodemailer = require("nodemailer");
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service preset
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates in development
  }
});

transporter.verify()
  .then(() => console.log("📧 Mailer ready"))
  .catch(err => console.error("Mailer error:", err));

// Generate password reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `http://10.0.0.26:5000/api/password-reset/reset?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Student Marketplace Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007AFF;">Student Marketplace</h2>
        <p>Hello,</p>
        <p>Follow this link to reset your Student Marketplace password for your <strong>${email}</strong> account.</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p>If you didn't ask to reset your password, you can ignore this email.</p>
        <p>Thanks,<br>Your Student Marketplace team</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email function (existing)
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Student Marketplace!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007AFF;">Welcome to Student Marketplace!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining Student Marketplace! You can now buy and sell items with other students.</p>
        <p>Best regards,<br>The Student Marketplace Team</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  generateResetToken
};
