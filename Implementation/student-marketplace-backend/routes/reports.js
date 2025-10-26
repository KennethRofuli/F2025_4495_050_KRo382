const express = require("express");
const {
  createReport,
  getUserReports
} = require("../controllers/reportController");
const auth = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create a report
router.post("/", createReport);

// Get user's reports
router.get("/my-reports", getUserReports);

module.exports = router;