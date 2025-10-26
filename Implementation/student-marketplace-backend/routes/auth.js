const express = require("express");
const { registerUser, loginUser, registerAdmin } = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/register-admin", registerAdmin); // Special admin registration

module.exports = router;
