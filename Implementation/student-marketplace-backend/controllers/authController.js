const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, campus } = req.body;
    
    // Validate input
    if (!name || !email || !password || !campus) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create user in our system (password will be hashed by pre-save hook)
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      password, 
      campus 
    });
    
    console.log(`✅ New user registered: ${user.email}`);
    res.json({ 
      success: true, 
      message: 'Account created successfully', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        campus: user.campus
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Special admin registration (remove this in production!)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, campus, adminSecret } = req.body;
    
    // Simple admin secret check (temporary for development)
    if (adminSecret !== 'admin_secret_2025') {
      return res.status(403).json({ error: "Invalid admin secret" });
    }
    
    const user = await User.create({ 
      name, 
      email, 
      password, 
      campus,
      role: 'admin'
    });
    
    res.json({ message: "Admin user created successfully", user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`❌ Login failed - User not found: ${email}`);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Login failed - Wrong password for: ${email}`);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log(`🔐 Login attempt for user: ${user.email} (ID: ${user._id})`);
    console.log(`📊 User status - Active: ${user.isActive}, Suspended: ${user.isSuspended}`);

    // Check if user account is active
    if (!user.isActive) {
      console.log(`🚫 Blocked login attempt - User ${user.email} is banned`);
      return res.status(403).json({ 
        error: "Your account has been permanently banned. Please contact support if you believe this is an error." 
      });
    }

    // Check if user is currently suspended
    if (user.isSuspended) {
      const now = new Date();
      
      // Check if temporary suspension has expired
      if (user.suspendedUntil && now > user.suspendedUntil) {
        // Suspension has expired, automatically unsuspend
        user.isSuspended = false;
        user.suspendedUntil = null;
        user.suspensionReason = null;
        await user.save();
        console.log(`🔓 User ${user.email} automatically unsuspended (suspension expired)`);
      } else {
        // User is still suspended
        console.log(`⏸️ Blocked login attempt - User ${user.email} is suspended until ${user.suspendedUntil || 'indefinitely'}`);
        
        const suspensionMessage = user.suspendedUntil 
          ? `Your account is suspended until ${user.suspendedUntil.toLocaleDateString()}.`
          : "Your account is suspended.";
        
        const reasonMessage = user.suspensionReason 
          ? ` Reason: ${user.suspensionReason}`
          : "";
          
        return res.status(403).json({ 
          error: `${suspensionMessage}${reasonMessage} Please contact support if you believe this is an error.` 
        });
      }
    }

    console.log(`✅ Login successful for user: ${user.email}`);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user });
  } catch (err) {
    console.error(`❌ Login error for ${email}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, campus, avatar } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        campus: campus?.trim(),
        avatar 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Find user and verify current password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
