const express = require("express");
const {
  getAllReports,
  getUsersWithReports,
  updateReport,
  moderateUser,
  deleteListing,
  getDashboardStats
} = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/reports", getAllReports);
router.get("/users", getUsersWithReports);

// Report management
router.put("/reports/:reportId", updateReport);

// User moderation
router.put("/users/:userId/moderate", moderateUser);

// Listing management
router.delete("/listings/:listingId", deleteListing);

module.exports = router;