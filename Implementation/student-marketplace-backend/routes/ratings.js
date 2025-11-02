const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

// Create a new rating
router.post('/create', auth, ratingController.createRating);

// Get ratings for a user
router.get('/user/:userId', ratingController.getUserRatings);

// Get rating statistics for a user
router.get('/stats/:userId', ratingController.getUserRatingStats);

// Get rating for a specific transaction
router.get('/transaction/:transactionId', auth, ratingController.getTransactionRating);

// Update existing rating
router.put('/:ratingId', auth, ratingController.updateRating);

// Delete rating (admin only)
router.delete('/:ratingId', auth, ratingController.deleteRating);

module.exports = router;