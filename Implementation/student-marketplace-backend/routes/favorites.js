const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

const router = express.Router();

// Add listing to favorites
router.post('/add/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Check if already favorited
    const user = await User.findById(userId);
    if (user.favorites.includes(listingId)) {
      return res.status(400).json({ success: false, error: 'Listing already in favorites' });
    }

    // Add to favorites
    user.favorites.push(listingId);
    await user.save();

    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Remove listing from favorites
router.delete('/remove/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(id => id.toString() !== listingId);
    await user.save();

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'favorites',
      populate: {
        path: 'seller',
        select: 'name campus'
      }
    });

    res.json({ success: true, data: user.favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Check if listing is favorited
router.get('/check/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isFavorited = user.favorites.includes(listingId);

    res.json({ success: true, isFavorited });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;