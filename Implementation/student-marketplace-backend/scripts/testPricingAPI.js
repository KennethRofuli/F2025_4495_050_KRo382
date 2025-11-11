/**
 * Simple test for AI Pricing API without server
 */

const PriceIntelligence = require('./priceIntelligenceDemo');

const testPricingAPI = async () => {
  console.log('🧪 Testing AI Pricing API...\n');
  
  try {
    const priceEngine = new PriceIntelligence();
    
    // Test price suggestion
    console.log('📝 Testing Price Suggestion:');
    const testItem = {
      title: 'MacBook Air M1',
      description: 'MacBook Air with M1 chip, 8GB RAM, 256GB SSD',
      category: 'Electronics',
      condition: 'Good',
      age: 18
    };
    
    const suggestion = await priceEngine.generatePricingSuggestion(testItem);
    console.log('Item:', testItem.title);
    console.log('Suggested Price:', suggestion.suggestedPrice ? `$${suggestion.suggestedPrice}` : 'N/A');
    console.log('Confidence:', suggestion.confidence ? `${Math.round(suggestion.confidence * 100)}%` : 'N/A');
    console.log('Reasoning:', suggestion.reasoning);
    
    console.log('\n📊 Testing Category Analysis:');
    const analysis = await priceEngine.analyzeCategoryPricing('Electronics');
    if (analysis) {
      console.log('Category: Electronics');
      console.log('Total Listings:', analysis.totalListings);
      console.log('Average Price:', `$${analysis.priceRange.average}`);
      console.log('Price Range:', `$${analysis.priceRange.min} - $${analysis.priceRange.max}`);
      console.log('Insights:', analysis.insights.length, 'detected');
    }
    
    console.log('\n✅ API Test Complete!');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
};

// Run test
testPricingAPI();