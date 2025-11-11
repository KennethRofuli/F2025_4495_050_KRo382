/**
 * Smart Demo Data Generator for Student Marketplace
 * Creates realistic listings that showcase AI pricing intelligence
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Listing = require('../models/Listing');

// Demo data configuration
const DEMO_CONFIG = {
  totalUsers: 12,
  totalListings: 45,
  categories: {
    'Textbooks': {
      count: 15,
      priceRange: [25, 200],
      conditions: ['Like New', 'Good', 'Fair', 'Poor'],
      subcategories: ['Engineering', 'Business', 'Science', 'Literature', 'Math']
    },
    'Electronics': {
      count: 12,
      priceRange: [50, 800],
      conditions: ['Excellent', 'Good', 'Fair'],
      subcategories: ['Phone', 'Laptop', 'Tablet', 'Audio', 'Gaming']
    },
    'Furniture': {
      count: 8,
      priceRange: [30, 300],
      conditions: ['Like New', 'Good', 'Worn'],
      subcategories: ['Desk', 'Chair', 'Bed', 'Storage', 'Decor']
    },
    'Clothing': {
      count: 6,
      priceRange: [10, 80],
      conditions: ['New', 'Like New', 'Good'],
      subcategories: ['Casual', 'Formal', 'Athletic', 'Outerwear']
    },
    'Sports': {
      count: 4,
      priceRange: [15, 150],
      conditions: ['Good', 'Fair', 'Used'],
      subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Individual']
    }
  }
};

// Realistic demo users
const DEMO_USERS = [
  { name: 'Sarah Chen', email: 'sarah.chen@university.edu', campus: 'North Campus' },
  { name: 'Marcus Johnson', email: 'marcus.j@university.edu', campus: 'South Campus' },
  { name: 'Emily Rodriguez', email: 'emily.r@university.edu', campus: 'North Campus' },
  { name: 'David Kim', email: 'david.kim@university.edu', campus: 'East Campus' },
  { name: 'Jessica Wilson', email: 'jessica.w@university.edu', campus: 'North Campus' },
  { name: 'Alex Thompson', email: 'alex.t@university.edu', campus: 'South Campus' },
  { name: 'Maya Patel', email: 'maya.p@university.edu', campus: 'East Campus' },
  { name: 'Chris Brown', email: 'chris.b@university.edu', campus: 'North Campus' },
  { name: 'Olivia Davis', email: 'olivia.d@university.edu', campus: 'South Campus' },
  { name: 'Ryan Miller', email: 'ryan.m@university.edu', campus: 'East Campus' },
  { name: 'Sophia Lee', email: 'sophia.l@university.edu', campus: 'North Campus' },
  { name: 'Jordan Taylor', email: 'jordan.t@university.edu', campus: 'South Campus' }
];

// Textbook data with realistic pricing variations
const TEXTBOOK_DATA = [
  // Engineering Textbooks (Higher value retention)
  { title: 'Engineering Mechanics: Statics', author: 'Hibbeler', edition: '14th', isbn: '9780133918922', basePrice: 285, semester: 'Spring' },
  { title: 'Fundamentals of Electric Circuits', author: 'Alexander', edition: '6th', isbn: '9780078028229', basePrice: 320, semester: 'Fall' },
  { title: 'Materials Science and Engineering', author: 'Callister', edition: '10th', isbn: '9781119405498', basePrice: 275, semester: 'Spring' },
  { title: 'Thermodynamics: An Engineering Approach', author: 'Cengel', edition: '9th', isbn: '9780073398174', basePrice: 290, semester: 'Fall' },
  { title: 'Calculus for Engineers', author: 'Stewart', edition: '8th', isbn: '9781285740621', basePrice: 350, semester: 'Both' },
  
  // Business Textbooks (Moderate retention)
  { title: 'Principles of Management', author: 'Robbins', edition: '13th', isbn: '9780134486833', basePrice: 280, semester: 'Fall' },
  { title: 'Financial Accounting', author: 'Warren', edition: '15th', isbn: '9781337272124', basePrice: 310, semester: 'Spring' },
  { title: 'Marketing Management', author: 'Kotler', edition: '16th', isbn: '9780134236933', basePrice: 295, semester: 'Fall' },
  
  // Science Textbooks
  { title: 'General Chemistry', author: 'Petrucci', edition: '11th', isbn: '9780132931281', basePrice: 315, semester: 'Both' },
  { title: 'Biology: The Unity and Diversity of Life', author: 'Starr', edition: '15th', isbn: '9781305073951', basePrice: 340, semester: 'Fall' },
  { title: 'Physics for Scientists and Engineers', author: 'Serway', edition: '10th', isbn: '9781337553278', basePrice: 380, semester: 'Spring' },
  
  // Literature (Lower retention)
  { title: 'The Norton Anthology of English Literature', author: 'Greenblatt', edition: '10th', isbn: '9780393603044', basePrice: 180, semester: 'Fall' },
  { title: 'Ways of Reading', author: 'Bartholomae', edition: '11th', isbn: '9781319056520', basePrice: 120, semester: 'Spring' },
  
  // Math Textbooks
  { title: 'Differential Equations and Linear Algebra', author: 'Edwards', edition: '4th', isbn: '9780134497181', basePrice: 325, semester: 'Both' },
  { title: 'Statistics for Engineers and Scientists', author: 'Navidi', edition: '5th', isbn: '9781259717604', basePrice: 290, semester: 'Fall' }
];

// Electronics data with depreciation patterns
const ELECTRONICS_DATA = [
  // Laptops (High depreciation)
  { type: 'MacBook Air', model: 'M1 13"', specs: '8GB RAM, 256GB SSD', originalPrice: 999, age: 18 },
  { type: 'Dell XPS 13', model: '2022', specs: '16GB RAM, 512GB SSD', originalPrice: 1200, age: 12 },
  { type: 'HP Pavilion', model: '15-eh1000', specs: '8GB RAM, 256GB SSD', originalPrice: 650, age: 8 },
  
  // Phones (Moderate depreciation)
  { type: 'iPhone 13', model: '128GB', specs: 'Space Gray, Unlocked', originalPrice: 799, age: 24 },
  { type: 'Samsung Galaxy S22', model: '256GB', specs: 'Phantom Black', originalPrice: 899, age: 18 },
  { type: 'Google Pixel 6', model: '128GB', specs: 'Stormy Black', originalPrice: 599, age: 20 },
  
  // Audio Equipment (Stable value)
  { type: 'Sony WH-1000XM4', model: 'Noise Canceling', specs: 'Black, Original Box', originalPrice: 349, age: 15 },
  { type: 'Audio-Technica ATH-M50x', model: 'Studio Monitor', specs: 'Professional', originalPrice: 149, age: 6 },
  
  // Gaming (Variable depreciation)
  { type: 'Nintendo Switch', model: 'OLED', specs: 'White, Complete', originalPrice: 349, age: 10 },
  { type: 'PlayStation 5 Controller', model: 'DualSense', specs: 'White, Like New', originalPrice: 69, age: 8 },
  
  // Tablets
  { type: 'iPad Air', model: '5th Gen', specs: '64GB WiFi, Blue', originalPrice: 599, age: 14 },
  { type: 'Microsoft Surface Go', model: '3', specs: '8GB, 128GB', originalPrice: 399, age: 16 }
];

// Furniture data
const FURNITURE_DATA = [
  { type: 'Desk Chair', brand: 'IKEA Markus', condition: 'Good', originalPrice: 199, age: 12 },
  { type: 'Study Desk', brand: 'IKEA Linnmon', condition: 'Like New', originalPrice: 89, age: 6 },
  { type: 'Bookshelf', brand: 'IKEA Billy', condition: 'Good', originalPrice: 60, age: 18 },
  { type: 'Bed Frame', brand: 'Zinus Platform', condition: 'Excellent', originalPrice: 120, age: 8 },
  { type: 'Dresser', brand: 'IKEA Hemnes', condition: 'Fair', originalPrice: 179, age: 24 },
  { type: 'Nightstand', brand: 'Target Room Essentials', condition: 'Good', originalPrice: 45, age: 10 },
  { type: 'Mini Fridge', brand: 'Danby Compact', condition: 'Excellent', originalPrice: 189, age: 15 },
  { type: 'Floor Lamp', brand: 'IKEA Holmo', condition: 'Like New', originalPrice: 25, age: 4 }
];

// Clothing data
const CLOTHING_DATA = [
  { type: 'North Face Jacket', size: 'M', condition: 'Like New', originalPrice: 150, season: 'Winter' },
  { type: 'Nike Running Shoes', size: '10', condition: 'Good', originalPrice: 120, season: 'All' },
  { type: 'Air Jordan 1 Limited Edition', size: '10', condition: 'New', originalPrice: 500, season: 'All' },
  { type: 'Supreme Box Logo Hoodie', size: 'L', condition: 'Like New', originalPrice: 800, season: 'Fall' },
  { type: 'Levi\'s Jeans', size: '32x30', condition: 'Good', originalPrice: 80, season: 'All' },
  { type: 'University Hoodie', size: 'L', condition: 'Excellent', originalPrice: 65, season: 'Fall' },
  { type: 'Vintage Nike Air Max 90', size: '9', condition: 'Good', originalPrice: 350, season: 'All' },
  { type: 'Dress Shirt', size: 'M', condition: 'Like New', originalPrice: 45, season: 'All' },
  { type: 'Adidas Sneakers', size: '9', condition: 'Fair', originalPrice: 90, season: 'All' },
  { type: 'Rare Pokemon T-Shirt Vintage', size: 'L', condition: 'Good', originalPrice: 180, season: 'All' }
];

// Sports equipment data
const SPORTS_DATA = [
  { type: 'Tennis Racket', brand: 'Wilson Pro Staff', condition: 'Good', originalPrice: 180, usage: 'Intermediate' },
  { type: 'Basketball', brand: 'Spalding Official', condition: 'Fair', originalPrice: 35, usage: 'Practice' },
  { type: 'Yoga Mat', brand: 'Manduka Pro', condition: 'Like New', originalPrice: 88, usage: 'Beginner' },
  { type: 'Dumbbells Set', brand: 'CAP Barbell', condition: 'Good', originalPrice: 120, usage: 'Home Gym' }
];

// Pricing intelligence functions
const calculateSmartPrice = (item, category, condition, ageMonths = 0) => {
  let price = item.basePrice || item.originalPrice;
  
  // Apply condition multipliers
  const conditionMultipliers = {
    'Excellent': 0.9, 'Like New': 0.85, 'New': 0.95,
    'Good': 0.75, 'Fair': 0.6, 'Poor': 0.4, 'Used': 0.7, 'Worn': 0.55
  };
  
  if (conditionMultipliers[condition]) {
    price *= conditionMultipliers[condition];
  }
  
  // Apply age depreciation (electronics depreciate faster)
  if (ageMonths > 0) {
    const monthlyDepreciation = category === 'Electronics' ? 0.03 : 0.01;
    const depreciationFactor = Math.max(0.3, 1 - (ageMonths * monthlyDepreciation));
    price *= depreciationFactor;
  }
  
  // Apply category-specific adjustments
  const categoryMultipliers = {
    'Textbooks': 1.0, // Base textbook pricing
    'Electronics': 1.0,
    'Furniture': 0.8, // Furniture loses value quickly
    'Clothing': 0.6, // Clothing has low resale value
    'Sports': 0.7   // Sports equipment moderate retention
  };
  
  if (categoryMultipliers[category]) {
    price *= categoryMultipliers[category];
  }
  
  // Add some realistic variance (±15%)
  const variance = 0.85 + (Math.random() * 0.3);
  price *= variance;
  
  return Math.round(price);
};

// Generate demo listings
const generateListings = (users) => {
  const listings = [];
  let listingId = 0;
  
  // Generate textbooks (limited to fit within total)
  TEXTBOOK_DATA.slice(0, 5).forEach((book, index) => {
    const conditions = ['Like New', 'Good', 'Fair'];
    conditions.forEach((condition, condIndex) => {
      if (listingId >= DEMO_CONFIG.totalListings) return;
      
      const seller = users[Math.floor(Math.random() * users.length)];
      const ageMonths = Math.floor(Math.random() * 24) + 1;
      const price = calculateSmartPrice(book, 'Textbooks', condition, ageMonths);
      
      listings.push({
        title: `${book.title} - ${book.edition} Edition`,
        description: `${book.title} by ${book.author}. ${book.edition} Edition. ISBN: ${book.isbn}. Condition: ${condition}. Used for ${book.semester} semester. ${condition === 'Like New' ? 'Minimal highlighting, excellent condition.' : condition === 'Good' ? 'Some highlighting and notes, still very usable.' : 'Moderate wear, all pages intact, readable.'}`,
        price: price,
        category: 'Textbooks',
        seller: seller._id,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date within last 90 days
      });
      listingId++;
    });
  });
  
  // Generate electronics
  ELECTRONICS_DATA.forEach((item, index) => {
    if (listingId >= DEMO_CONFIG.totalListings) return;
    
    const conditions = ['Excellent', 'Good', 'Fair'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const seller = users[Math.floor(Math.random() * users.length)];
    const price = calculateSmartPrice(item, 'Electronics', condition, item.age);
    
    listings.push({
      title: `${item.type} ${item.model}`,
      description: `${item.type} ${item.model}. ${item.specs}. Condition: ${condition}. ${condition === 'Excellent' ? 'Barely used, like new condition.' : condition === 'Good' ? 'Normal wear, works perfectly.' : 'Shows wear but fully functional.'} Original price: $${item.originalPrice}.`,
      price: price,
      category: 'Electronics',
      seller: seller._id,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    });
    listingId++;
  });
  
  // Generate furniture
  FURNITURE_DATA.forEach((item, index) => {
    if (listingId >= DEMO_CONFIG.totalListings) return;
    
    const seller = users[Math.floor(Math.random() * users.length)];
    const price = calculateSmartPrice(item, 'Furniture', item.condition, item.age);
    
    listings.push({
      title: `${item.type} - ${item.brand}`,
      description: `${item.type} from ${item.brand}. Condition: ${item.condition}. ${item.condition === 'Excellent' ? 'Like new, no damage.' : item.condition === 'Good' ? 'Minor scuffs, very functional.' : 'Shows wear, still sturdy and usable.'} Perfect for dorm or apartment.`,
      price: price,
      category: 'Furniture',
      seller: seller._id,
      createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000)
    });
    listingId++;
  });
  
  // Generate clothing
  CLOTHING_DATA.forEach((item, index) => {
    if (listingId >= DEMO_CONFIG.totalListings) return;
    
    const seller = users[Math.floor(Math.random() * users.length)];
    const price = calculateSmartPrice(item, 'Clothing', item.condition);
    
    listings.push({
      title: `${item.type} - Size ${item.size}`,
      description: `${item.type}, size ${item.size}. Condition: ${item.condition}. ${item.condition === 'Like New' ? 'Worn only a few times.' : item.condition === 'Good' ? 'Normal wear, well maintained.' : 'Shows wear but still good quality.'} ${item.season !== 'All' ? `Perfect for ${item.season.toLowerCase()} season.` : ''}`,
      price: price,
      category: 'Clothing',
      seller: seller._id,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
    listingId++;
  });
  
  // Generate sports equipment
  SPORTS_DATA.forEach((item, index) => {
    if (listingId >= DEMO_CONFIG.totalListings) return;
    
    const seller = users[Math.floor(Math.random() * users.length)];
    const price = calculateSmartPrice(item, 'Sports', item.condition);
    
    listings.push({
      title: `${item.type} - ${item.brand}`,
      description: `${item.type} by ${item.brand}. Condition: ${item.condition}. Great for ${item.usage.toLowerCase()}. ${item.condition === 'Like New' ? 'Barely used, excellent condition.' : item.condition === 'Good' ? 'Well maintained, works great.' : 'Shows use but still functional.'}`,
      price: price,
      category: 'Sports',
      seller: seller._id,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    });
    listingId++;
  });
  
  return listings.slice(0, DEMO_CONFIG.totalListings);
};

// Database connection and data generation
const generateDemoData = async () => {
  try {
    console.log('🚀 Starting demo data generation...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️ Clearing existing demo data...');
    await User.deleteMany({ email: { $regex: '@university\.edu$' } });
    await Listing.deleteMany({});
    
    // Create demo users
    console.log('👥 Creating demo users...');
    const users = [];
    for (const userData of DEMO_USERS) {
      const user = new User({
        ...userData,
        password: 'password123', // Will be hashed by pre-save hook
        averageRating: 4.0 + (Math.random() * 1.0), // Random rating between 4.0-5.0
        totalRatings: Math.floor(Math.random() * 20) + 5,
        sellerTransactions: Math.floor(Math.random() * 15),
        buyerTransactions: Math.floor(Math.random() * 10)
      });
      await user.save();
      users.push(user);
    }
    console.log(`✅ Created ${users.length} demo users`);
    
    // Generate listings
    console.log('📝 Creating demo listings...');
    const listings = generateListings(users);
    
    for (const listingData of listings) {
      const listing = new Listing(listingData);
      await listing.save();
    }
    console.log(`✅ Created ${listings.length} demo listings`);
    
    // Add some favorites for realism
    console.log('❤️ Adding favorites...');
    for (const user of users) {
      const randomListings = await Listing.aggregate([
        { $match: { seller: { $ne: user._id } } },
        { $sample: { size: Math.floor(Math.random() * 5) + 1 } }
      ]);
      
      user.favorites = randomListings.map(listing => listing._id);
      await user.save();
    }
    console.log('✅ Added random favorites');
    
    // Generate summary statistics
    console.log('\n📊 Demo Data Summary:');
    console.log(`Users: ${users.length}`);
    console.log(`Listings: ${listings.length}`);
    
    const categoryStats = await Listing.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nCategory Breakdown:');
    categoryStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} items, $${Math.round(stat.avgPrice)} avg (${stat.minPrice}-${stat.maxPrice})`);
    });
    
    console.log('\n🎯 AI Pricing Features Ready to Demo:');
    console.log('✓ Price variation analysis (same items at different prices)');
    console.log('✓ Condition-based pricing patterns');
    console.log('✓ Category-specific value retention');
    console.log('✓ Age depreciation modeling');
    console.log('✓ Market anomaly detection opportunities');
    console.log('✓ Seasonal pricing insights');
    
    console.log('\n🎉 Demo data generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Run the generator
if (require.main === module) {
  generateDemoData();
}

module.exports = { generateDemoData, calculateSmartPrice };