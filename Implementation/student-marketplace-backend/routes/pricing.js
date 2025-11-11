const express = require('express');
const router = express.Router();
const PriceIntelligence = require('../scripts/priceIntelligenceDemo');

// Initialize price intelligence engine
const priceEngine = new PriceIntelligence();

// GET /api/pricing/suggestion - Get AI price suggestion for new listing
router.post('/suggestion', async (req, res) => {
  try {
    const { title, description, category, condition, age } = req.body;
    
    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required for price suggestion'
      });
    }
    
    // Generate pricing suggestion
    const suggestion = await priceEngine.generatePricingSuggestion({
      title: title.trim(),
      description: description || '',
      category: category.trim(),
      condition: condition || 'Good',
      age: age || 0
    });
    
    res.json({
      success: true,
      data: suggestion
    });
    
  } catch (error) {
    console.error('Price suggestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate price suggestion'
    });
  }
});

// GET /api/pricing/market-stats/:category - Get market analysis for category
router.get('/market-stats/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const analysis = await priceEngine.analyzeCategoryPricing(category);
    
    if (!analysis) {
      return res.json({
        success: true,
        data: null,
        message: 'No data available for this category'
      });
    }
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Market stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market statistics'
    });
  }
});

// GET /api/pricing/deal-score/:listingId - Get deal score for specific listing
router.get('/deal-score/:listingId', async (req, res) => {
  try {
    const Listing = require('../models/Listing');
    const { listingId } = req.params;
    
    // Get the listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }
    
    // Analyze the listing price against market
    const categoryAnalysis = await priceEngine.analyzeCategoryPricing(listing.category);
    
    if (!categoryAnalysis) {
      return res.json({
        success: true,
        data: { 
          score: 'unknown',
          message: 'Insufficient market data',
          confidence: 0
        }
      });
    }
    
    // Check for premium item indicators
    const isPremiumItem = (title, description) => {
      const premiumKeywords = [
        'limited edition', 'rare', 'vintage', 'collector', 'signed',
        'jordan', 'supreme', 'gucci', 'louis vuitton', 'rolex',
        'first edition', 'mint condition', 'brand new', 'sealed',
        'apple', 'iphone 15', 'macbook pro', 'gaming pc'
      ];
      
      const text = (title + ' ' + (description || '')).toLowerCase();
      return premiumKeywords.some(keyword => text.includes(keyword));
    };
    
    // Calculate deal score with premium adjustment
    let avgPrice = categoryAnalysis.priceRange.average;
    
    // Apply premium multiplier for luxury/premium items
    if (isPremiumItem(listing.title, listing.description)) {
      avgPrice *= 1.8; // Premium items expected to be 80% higher
    }
    
    const priceRatio = listing.price / avgPrice;
    
    let score, message, confidence;
    
    if (priceRatio <= 0.8) {
      score = 'hot-deal';
      message = `${Math.round((1 - priceRatio) * 100)}% below average`;
      confidence = 0.9;
    } else if (priceRatio <= 0.95) {
      score = 'good-deal';
      message = `${Math.round((1 - priceRatio) * 100)}% below average`;
      confidence = 0.85;
    } else if (priceRatio <= 1.15) {
      score = 'fair-price';
      message = 'Market price';
      confidence = 0.8;
    } else if (priceRatio <= 1.5) {
      score = 'overpriced';
      message = `${Math.round((priceRatio - 1) * 100)}% above average`;
      confidence = 0.85;
    } else {
      score = 'very-overpriced';
      message = `${Math.round((priceRatio - 1) * 100)}% above average`;
      confidence = 0.9;
    }
    
    res.json({
      success: true,
      data: {
        score,
        message,
        confidence,
        marketAverage: Math.round(avgPrice),
        currentPrice: listing.price,
        category: listing.category
      }
    });
    
  } catch (error) {
    console.error('Deal score error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate deal score'
    });
  }
});

// GET /api/pricing/overview - Get overall market overview
router.get('/overview', async (req, res) => {
  try {
    const Listing = require('../models/Listing');
    
    // Get all unique categories that have listings
    const usedCategories = await Listing.distinct('category');
    const overview = {};
    
    for (const category of usedCategories) {
      const analysis = await priceEngine.analyzeCategoryPricing(category);
      if (analysis) {
        overview[category] = {
          totalListings: analysis.totalListings,
          averagePrice: analysis.priceRange.average,
          priceRange: analysis.priceRange,
          insights: analysis.insights.slice(0, 2) // Top 2 insights
        };
      }
    }
    
    res.json({
      success: true,
      data: overview
    });
    
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market overview'
    });
  }
});

module.exports = router;