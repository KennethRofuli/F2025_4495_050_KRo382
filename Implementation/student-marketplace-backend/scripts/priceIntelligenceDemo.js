/**
 * AI Price Intelligence Demo
 * Demonstrates smart pricing analysis features
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Listing = require('../models/Listing');
const Category = require('../models/Category');

class PriceIntelligence {
  constructor() {
    // Default configuration for unregistered categories
    this.defaultCategoryConfig = {
      seasonalMultiplier: { 'Fall': 1.0, 'Spring': 1.0, 'Summer': 1.0 },
      retentionRate: 0.5,
      avgDepreciationPerMonth: 0.03
    };
    
    // Cache for category configurations
    this.categoryCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    // Legacy hardcoded data (will be moved to database)
    this.categoryData = {
      'Textbooks': {
        seasonalMultiplier: { 'Fall': 1.2, 'Spring': 1.1, 'Summer': 0.8 },
        retentionRate: 0.7, // Textbooks hold value well
        avgDepreciationPerMonth: 0.02
      },
      'Electronics': {
        seasonalMultiplier: { 'Fall': 1.0, 'Spring': 0.95, 'Summer': 0.9 },
        retentionRate: 0.4, // Electronics depreciate quickly
        avgDepreciationPerMonth: 0.05
      },
      'Furniture': {
        seasonalMultiplier: { 'Fall': 1.1, 'Spring': 0.9, 'Summer': 1.0 },
        retentionRate: 0.5,
        avgDepreciationPerMonth: 0.03
      },
      'Clothing': {
        seasonalMultiplier: { 'Fall': 1.0, 'Spring': 0.8, 'Summer': 0.7 },
        retentionRate: 0.3, // Clothing has low resale value
        avgDepreciationPerMonth: 0.04
      },
      'Sports': {
        seasonalMultiplier: { 'Fall': 1.0, 'Spring': 1.1, 'Summer': 1.2 },
        retentionRate: 0.6,
        avgDepreciationPerMonth: 0.025
      },
      'Toys': {
        seasonalMultiplier: { 'Fall': 1.1, 'Spring': 0.9, 'Summer': 1.0 },
        retentionRate: 0.4, // Toys depreciate moderately
        avgDepreciationPerMonth: 0.035
      }
    };
  }

  // Get category configuration with hybrid approach
  async getCategoryConfig(categoryName) {
    const cacheKey = categoryName.toLowerCase();
    const cached = this.categoryCache.get(cacheKey);
    
    // Return cached if valid
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.config;
    }

    try {
      // Try to find registered category first
      const registeredCategory = await Category.findOne({ 
        name: categoryName, 
        active: true 
      }).lean();

      let config;
      if (registeredCategory && registeredCategory.aiConfig) {
        config = registeredCategory.aiConfig;
      } else {
        // Fall back to legacy hardcoded data
        config = this.categoryData[categoryName] || { ...this.defaultCategoryConfig };
      }

      // Cache the result
      this.categoryCache.set(cacheKey, {
        config,
        timestamp: Date.now(),
        isRegistered: !!registeredCategory
      });

      return config;
    } catch (error) {
      console.error('Error fetching category config:', error);
      return this.categoryData[categoryName] || { ...this.defaultCategoryConfig };
    }
  }

  // Analyze price patterns within a category
  async analyzeCategoryPricing(category) {
    const listings = await Listing.find({ category }).sort({ price: 1 });
    
    if (listings.length === 0) return null;
    
    const prices = listings.map(l => l.price);
    const analysis = {
      category,
      totalListings: listings.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        median: this.calculateMedian(prices),
        average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      },
      priceDistribution: this.analyzePriceDistribution(prices),
      anomalies: this.detectPriceAnomalies(listings),
      insights: await this.generateCategoryInsights(category, listings)
    };
    
    return analysis;
  }

  // Calculate median price
  calculateMedian(prices) {
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  // Analyze price distribution
  analyzePriceDistribution(prices) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const bucketSize = range / 4;
    
    const buckets = {
      'Budget': 0,      // Bottom 25%
      'Mid-Range': 0,   // 25-50%
      'Premium': 0,     // 50-75%
      'Luxury': 0       // Top 25%
    };
    
    prices.forEach(price => {
      const position = (price - min) / range;
      if (position <= 0.25) buckets['Budget']++;
      else if (position <= 0.5) buckets['Mid-Range']++;
      else if (position <= 0.75) buckets['Premium']++;
      else buckets['Luxury']++;
    });
    
    return buckets;
  }

  // Detect pricing anomalies
  detectPriceAnomalies(listings) {
    const prices = listings.map(l => l.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = Math.sqrt(prices.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / prices.length);
    
    const anomalies = {
      overpriced: [],
      underpriced: [],
      insights: []
    };
    
    listings.forEach(listing => {
      const deviation = (listing.price - avg) / stdDev;
      
      if (deviation > 2) {
        anomalies.overpriced.push({
          id: listing._id,
          title: listing.title,
          price: listing.price,
          avgPrice: Math.round(avg),
          percentAbove: Math.round(((listing.price - avg) / avg) * 100)
        });
      } else if (deviation < -2) {
        anomalies.underpriced.push({
          id: listing._id,
          title: listing.title,
          price: listing.price,
          avgPrice: Math.round(avg),
          percentBelow: Math.round(((avg - listing.price) / avg) * 100)
        });
      }
    });
    
    return anomalies;
  }

  // Generate AI insights for category
  async generateCategoryInsights(category, listings) {
    const insights = [];
    const categoryInfo = await this.getCategoryConfig(category);
    
    if (!categoryInfo) return insights;
    
    // Price range insights
    const prices = listings.map(l => l.price);
    const priceSpread = Math.max(...prices) - Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    if (priceSpread / avgPrice > 1.5) {
      insights.push({
        type: 'market_opportunity',
        message: `Wide price range detected (${Math.round(priceSpread / avgPrice * 100)}% spread). Consider pricing competitively.`,
        confidence: 0.85
      });
    }
    
    // Volume insights
    if (listings.length > 8) {
      insights.push({
        type: 'market_saturation',
        message: `High supply in ${category} (${listings.length} active listings). Competitive pricing recommended.`,
        confidence: 0.9
      });
    } else if (listings.length < 3) {
      insights.push({
        type: 'market_opportunity',
        message: `Low supply in ${category}. Premium pricing possible.`,
        confidence: 0.8
      });
    }
    
    // Category-specific insights
    if (category === 'Textbooks') {
      const currentMonth = new Date().getMonth();
      const semester = currentMonth >= 7 && currentMonth <= 11 ? 'Fall' : 'Spring';
      insights.push({
        type: 'seasonal',
        message: `${semester} semester pricing active. Textbooks typically ${semester === 'Fall' ? 'gain' : 'maintain'} value during this period.`,
        confidence: 0.95
      });
    }
    
    if (category === 'Electronics') {
      insights.push({
        type: 'depreciation',
        message: 'Electronics depreciate ~5% per month. Age significantly impacts pricing.',
        confidence: 0.9
      });
    }
    
    if (category === 'Toys') {
      insights.push({
        type: 'seasonal',
        message: 'Toys see increased demand during fall semester (back-to-school) and maintain steady value.',
        confidence: 0.85
      });
    }
    
    return insights;
  }

  // Generate smart pricing suggestion for a new listing
  async generatePricingSuggestion(itemData) {
    const { title, description, category, condition, age } = itemData;
    
    // Get similar items
    const similarItems = await Listing.find({
      category,
      $or: [
        { title: { $regex: title.split(' ').slice(0, 2).join('|'), $options: 'i' } },
        { description: { $regex: title.split(' ').slice(0, 2).join('|'), $options: 'i' } }
      ]
    }).sort({ createdAt: -1 }).limit(10);
    
    const categoryAnalysis = await this.analyzeCategoryPricing(category);
    
    if (!categoryAnalysis || similarItems.length === 0) {
      return {
        suggestedPrice: null,
        confidence: 0,
        reasoning: 'Insufficient market data for pricing analysis'
      };
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
    
    // Calculate base price from similar items
    const similarPrices = similarItems.map(item => item.price);
    let basePrice = similarPrices.reduce((a, b) => a + b, 0) / similarPrices.length;
    
    // Apply premium multiplier for luxury/collectible items
    if (isPremiumItem(title, description)) {
      basePrice *= 1.6; // Premium items command 60% higher prices
    }
    
    // Apply condition adjustments
    const conditionMultipliers = {
      'Excellent': 1.0, 'Like New': 0.95, 'New': 1.05,
      'Good': 0.85, 'Fair': 0.70, 'Poor': 0.50
    };
    
    let adjustedPrice = basePrice * (conditionMultipliers[condition] || 0.85);
    
    // Apply age depreciation if provided
    if (age && this.categoryData[category]) {
      const monthlyDepreciation = this.categoryData[category].avgDepreciationPerMonth;
      adjustedPrice *= Math.max(0.3, 1 - (age * monthlyDepreciation));
    }
    
    // Calculate confidence based on data quality
    const confidence = Math.min(0.95, 0.5 + (similarItems.length * 0.1));
    
    const suggestion = {
      suggestedPrice: Math.round(adjustedPrice),
      priceRange: {
        min: Math.round(adjustedPrice * 0.85),
        max: Math.round(adjustedPrice * 1.15)
      },
      confidence,
      reasoning: this.generatePricingReasoning(similarItems.length, category, condition, basePrice, adjustedPrice),
      marketContext: {
        similarItems: similarItems.length,
        categoryAverage: categoryAnalysis.priceRange.average,
        marketPosition: this.calculateMarketPosition(adjustedPrice, categoryAnalysis.priceRange)
      }
    };
    
    return suggestion;
  }

  // Generate human-readable pricing reasoning
  generatePricingReasoning(similarCount, category, condition, basePrice, finalPrice) {
    let reasoning = `Based on ${similarCount} similar ${category.toLowerCase()} listings`;
    
    if (condition) {
      reasoning += ` and "${condition}" condition`;
    }
    
    const adjustment = ((finalPrice - basePrice) / basePrice) * 100;
    if (Math.abs(adjustment) > 5) {
      reasoning += `. ${adjustment > 0 ? 'Premium' : 'Discount'} of ${Math.abs(Math.round(adjustment))}% applied`;
    }
    
    reasoning += '.';
    return reasoning;
  }

  // Calculate market position
  calculateMarketPosition(price, priceRange) {
    const position = (price - priceRange.min) / (priceRange.max - priceRange.min);
    
    if (position < 0.25) return 'Budget-friendly';
    if (position < 0.5) return 'Below average';
    if (position < 0.75) return 'Above average';
    return 'Premium pricing';
  }

  // Demo function to showcase all AI features
  async runPricingDemo() {
    console.log('🤖 AI Price Intelligence Demo\n');
    
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to database\n');
      
      // Analyze all categories
      const categories = ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Toys'];
      
      for (const category of categories) {
        console.log(`📊 ${category} Analysis:`);
        console.log('=' + '='.repeat(category.length + 10));
        
        const analysis = await this.analyzeCategoryPricing(category);
        if (analysis) {
          console.log(`Total listings: ${analysis.totalListings}`);
          console.log(`Price range: $${analysis.priceRange.min} - $${analysis.priceRange.max}`);
          console.log(`Average: $${analysis.priceRange.average} | Median: $${analysis.priceRange.median}`);
          
          // Show price distribution
          console.log('Price Distribution:');
          Object.entries(analysis.priceDistribution).forEach(([tier, count]) => {
            console.log(`  ${tier}: ${count} items`);
          });
          
          // Show anomalies
          if (analysis.anomalies.overpriced.length > 0) {
            console.log('💰 Potentially Overpriced:');
            analysis.anomalies.overpriced.slice(0, 2).forEach(item => {
              console.log(`  "${item.title}" - $${item.price} (${item.percentAbove}% above average)`);
            });
          }
          
          if (analysis.anomalies.underpriced.length > 0) {
            console.log('🔥 Great Deals Detected:');
            analysis.anomalies.underpriced.slice(0, 2).forEach(item => {
              console.log(`  "${item.title}" - $${item.price} (${item.percentBelow}% below average)`);
            });
          }
          
          // Show AI insights
          if (analysis.insights.length > 0) {
            console.log('🧠 AI Insights:');
            analysis.insights.forEach(insight => {
              console.log(`  ${insight.message} (${Math.round(insight.confidence * 100)}% confidence)`);
            });
          }
        } else {
          console.log('No data available for analysis');
        }
        console.log('\n');
      }
      
      // Demo pricing suggestion
      console.log('💡 Smart Pricing Suggestion Demo:');
      console.log('=' + '='.repeat(32));
      
      const testItem = {
        title: 'MacBook Air M1',
        description: 'MacBook Air with M1 chip, 8GB RAM, 256GB SSD',
        category: 'Electronics',
        condition: 'Good',
        age: 18 // 18 months old
      };
      
      const suggestion = await this.generatePricingSuggestion(testItem);
      console.log(`Item: ${testItem.title} (${testItem.condition}, ${testItem.age} months old)`);
      console.log(`Suggested Price: $${suggestion.suggestedPrice}`);
      console.log(`Price Range: $${suggestion.priceRange.min} - $${suggestion.priceRange.max}`);
      console.log(`Confidence: ${Math.round(suggestion.confidence * 100)}%`);
      console.log(`Market Position: ${suggestion.marketContext.marketPosition}`);
      console.log(`Reasoning: ${suggestion.reasoning}`);
      
    } catch (error) {
      console.error('❌ Demo error:', error);
    } finally {
      await mongoose.disconnect();
      console.log('\n👋 Demo complete!');
    }
  }
}

// Run demo if called directly
if (require.main === module) {
  const priceIntelligence = new PriceIntelligence();
  priceIntelligence.runPricingDemo();
}

module.exports = PriceIntelligence;