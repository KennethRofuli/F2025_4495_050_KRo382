const Rating = require('../models/Rating');
const User = require('../models/User');
const Listing = require('../models/Listing');
const mongoose = require('mongoose');

// Create a new rating
const createRating = async (req, res) => {
  try {
    const { 
      ratedUserId, 
      listingId, 
      rating, 
      review, 
      ratingType, 
      categories 
    } = req.body;
    
    const raterUserId = req.user.id;
    
    // Validate that user can rate (must be involved in transaction)
    const listing = await Listing.findById(listingId).populate('seller');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is authorized to rate
    const canRate = (ratingType === 'seller' && req.user.id !== listing.seller._id.toString()) ||
                   (ratingType === 'buyer' && req.user.id === listing.seller._id.toString());
    
    if (!canRate) {
      return res.status(403).json({ message: 'Not authorized to rate this user' });
    }
    
    // Create unique transaction ID to prevent duplicate ratings
    const transactionId = `${listingId}_${raterUserId}_${ratedUserId}`;
    
    // Check if rating already exists
    const existingRating = await Rating.findOne({ transactionId });
    if (existingRating) {
      // Update existing rating instead of creating new one
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      existingRating.categories = categories || existingRating.categories;
      await existingRating.save();
      
      // Update user's rating statistics
      await updateUserRatings(ratedUserId, ratingType);
      
      return res.status(200).json({ 
        message: 'Rating updated successfully', 
        rating: existingRating,
        isUpdate: true
      });
    }
    
    // Create new rating
    const newRating = new Rating({
      ratedUser: ratedUserId,
      raterUser: raterUserId,
      listing: listingId,
      rating,
      review,
      ratingType,
      categories,
      transactionId
    });
    
    await newRating.save();
    
    // Update user's rating statistics
    await updateUserRatings(ratedUserId, ratingType);
    
    res.status(201).json({ 
      message: 'Rating created successfully', 
      rating: newRating,
      isUpdate: false
    });
    
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ 
      message: 'Error creating rating', 
      error: error.message 
    });
  }
};

// Get ratings for a user
const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, page = 1, limit = 10 } = req.query;
    
    const query = { 
      ratedUser: userId, 
      isVisible: true 
    };
    
    if (type && ['seller', 'buyer'].includes(type)) {
      query.ratingType = type;
    }
    
    const ratings = await Rating.find(query)
      .populate('raterUser', 'name avatar')
      .populate('listing', 'title images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalRatings = await Rating.countDocuments(query);
    
    res.json({
      ratings,
      totalPages: Math.ceil(totalRatings / limit),
      currentPage: page,
      totalRatings
    });
    
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ 
      message: 'Error fetching ratings', 
      error: error.message 
    });
  }
};

// Update user rating statistics
async function updateUserRatings(userId, ratingType) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Get all ratings for this user
    const allRatings = await Rating.find({ 
      ratedUser: userId, 
      isVisible: true 
    });
    
    if (allRatings.length === 0) return;
    
    // Calculate overall statistics
    const totalRatings = allRatings.length;
    const ratingSum = allRatings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = ratingSum / totalRatings;
    
    // Calculate type-specific statistics
    const sellerRatings = allRatings.filter(r => r.ratingType === 'seller');
    const buyerRatings = allRatings.filter(r => r.ratingType === 'buyer');
    
    const sellerAverage = sellerRatings.length > 0 
      ? sellerRatings.reduce((sum, r) => sum + r.rating, 0) / sellerRatings.length 
      : 0;
      
    const buyerAverage = buyerRatings.length > 0 
      ? buyerRatings.reduce((sum, r) => sum + r.rating, 0) / buyerRatings.length 
      : 0;
    
    // Update user document
    await User.findByIdAndUpdate(userId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings,
      ratingSum,
      sellerRating: Math.round(sellerAverage * 10) / 10,
      buyerRating: Math.round(buyerAverage * 10) / 10,
      sellerTransactions: sellerRatings.length,
      buyerTransactions: buyerRatings.length
    });
    
  } catch (error) {
    console.error('Update user ratings error:', error);
  }
}

// Get rating statistics for a user
const getUserRatingStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select(
      'averageRating totalRatings sellerRating buyerRating sellerTransactions buyerTransactions'
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get rating distribution
    const ratingDistribution = await Rating.aggregate([
      { $match: { ratedUser: new mongoose.Types.ObjectId(userId), isVisible: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      ...user.toObject(),
      ratingDistribution
    });
    
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching rating statistics', 
      error: error.message 
    });
  }
};

// Update existing rating
const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review, categories } = req.body;
    
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user owns this rating
    if (existingRating.raterUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this rating' });
    }
    
    // Update rating
    existingRating.rating = rating || existingRating.rating;
    existingRating.review = review || existingRating.review;
    existingRating.categories = categories || existingRating.categories;
    
    await existingRating.save();
    
    // Recalculate user ratings
    await updateUserRatings(existingRating.ratedUser, existingRating.ratingType);
    
    res.json({ 
      message: 'Rating updated successfully', 
      rating: existingRating 
    });
    
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ 
      message: 'Error updating rating', 
      error: error.message 
    });
  }
};

// Get existing rating for a transaction
const getTransactionRating = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const raterUserId = req.user.id;
    
    console.log('🔍 Looking for rating with transactionId:', transactionId);
    console.log('🔍 Looking for raterUser:', raterUserId);
    
    const existingRating = await Rating.findOne({ 
      transactionId,
      raterUser: raterUserId,
      isVisible: true 
    });
    
    console.log('📊 Found existing rating:', existingRating);
    
    if (existingRating) {
      res.json({
        rating: existingRating,
        hasRated: true
      });
    } else {
      res.json({
        rating: null,
        hasRated: false
      });
    }
    
  } catch (error) {
    console.error('Get transaction rating error:', error);
    res.status(500).json({ 
      message: 'Error getting transaction rating', 
      error: error.message 
    });
  }
};

// Delete rating (admin only)
const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Soft delete - just hide it
    rating.isVisible = false;
    await rating.save();
    
    // Recalculate user ratings
    await updateUserRatings(rating.ratedUser, rating.ratingType);
    
    res.json({ message: 'Rating deleted successfully' });
    
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ 
      message: 'Error deleting rating', 
      error: error.message 
    });
  }
};

module.exports = {
  createRating,
  getUserRatings,
  getUserRatingStats,
  updateRating,
  deleteRating,
  getTransactionRating
};