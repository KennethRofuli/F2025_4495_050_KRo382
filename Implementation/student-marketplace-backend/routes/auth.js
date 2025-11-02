const express = require("express");
const { 
  registerUser, 
  loginUser, 
  registerAdmin, 
  updateProfile, 
  changePassword, 
  getProfile 
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/register-admin", registerAdmin); // Special admin registration

// Protected profile routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

module.exports = router;
