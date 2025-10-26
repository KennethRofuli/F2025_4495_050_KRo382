const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, campus } = req.body;
    const user = await User.create({ name, email, password, campus });
    res.json(user);
  } catch (err) {
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
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

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
