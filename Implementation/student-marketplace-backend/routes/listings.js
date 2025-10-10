const express = require("express");
const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings
} = require("../controllers/listingController");
const auth = require("../middleware/auth");

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllListings);          // GET /api/listings
router.get("/:id", getListingById);       // GET /api/listings/:id

// Protected routes (authentication required)
router.post("/", auth, createListing);    // POST /api/listings
router.put("/:id", auth, updateListing);  // PUT /api/listings/:id
router.delete("/:id", auth, deleteListing); // DELETE /api/listings/:id
router.get("/user/my-listings", auth, getMyListings); // GET /api/listings/user/my-listings

module.exports = router;
