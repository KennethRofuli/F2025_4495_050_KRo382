/**
 * Category Migration Script
 * Migrates hardcoded categories to database with AI configurations
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

const defaultCategories = [
  {
    name: 'Textbooks',
    icon: '📚',
    displayOrder: 1,
    description: 'Academic textbooks and educational materials',
    keywords: ['textbook', 'book', 'manual', 'study', 'academic'],
    aiConfig: {
      seasonalMultiplier: { Fall: 1.2, Spring: 1.1, Summer: 0.8 },
      retentionRate: 0.7,
      avgDepreciationPerMonth: 0.02
    }
  },
  {
    name: 'Electronics',
    icon: '💻',
    displayOrder: 2,
    description: 'Computers, phones, gaming devices and tech accessories',
    keywords: ['laptop', 'phone', 'computer', 'tablet', 'gaming', 'tech'],
    aiConfig: {
      seasonalMultiplier: { Fall: 1.0, Spring: 0.95, Summer: 0.9 },
      retentionRate: 0.4,
      avgDepreciationPerMonth: 0.05
    }
  },
  {
    name: 'Furniture',
    icon: '🪑',
    displayOrder: 3,
    description: 'Dorm and apartment furniture',
    keywords: ['chair', 'desk', 'table', 'bed', 'sofa', 'furniture'],
    aiConfig: {
      seasonalMultiplier: { Fall: 1.1, Spring: 0.9, Summer: 1.0 },
      retentionRate: 0.5,
      avgDepreciationPerMonth: 0.03
    }
  },
  {
    name: 'Clothing',
    icon: '👕',
    displayOrder: 4,
    description: 'Apparel, shoes and fashion accessories',
    keywords: ['shirt', 'pants', 'shoes', 'jacket', 'dress', 'fashion'],
    aiConfig: {
      seasonalMultiplier: { Fall: 1.0, Spring: 0.8, Summer: 0.7 },
      retentionRate: 0.3,
      avgDepreciationPerMonth: 0.04
    }
  },
  {
    name: 'Sports',
    icon: '⚽',
    displayOrder: 5,
    description: 'Sports equipment and fitness gear',
    keywords: ['sports', 'fitness', 'gym', 'exercise', 'equipment'],
    aiConfig: {
      seasonalMultiplier: { Fall: 1.0, Spring: 1.1, Summer: 1.2 },
      retentionRate: 0.6,
      avgDepreciationPerMonth: 0.025
    }
  },
  {
    name: 'Toys',
    icon: '🧸',
    displayOrder: 6,
    description: 'Toys, games and collectibles',
    keywords: ['toy', 'game', 'collectible', 'board game', 'action figure'],
    aiConfig: {
      seasonalMultiplier: { Fall: 1.1, Spring: 0.9, Summer: 1.0 },
      retentionRate: 0.4,
      avgDepreciationPerMonth: 0.035
    }
  }
];

async function migrateCategories() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing categories. Migration skipped.`);
      console.log('   Use --force to overwrite existing categories');
      return;
    }

    // Insert default categories
    for (const categoryData of defaultCategories) {
      try {
        const category = new Category(categoryData);
        await category.save();
        console.log(`✅ Created category: ${categoryData.name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Category ${categoryData.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating ${categoryData.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Category migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your backend server');
    console.log('2. Refresh the Market Intelligence screen');
    console.log('3. Your app now supports dynamic categories!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
if (require.main === module) {
  const forceMode = process.argv.includes('--force');
  
  if (forceMode) {
    console.log('🔄 Force mode enabled - will overwrite existing categories');
  }
  
  migrateCategories();
}

module.exports = { migrateCategories, defaultCategories };