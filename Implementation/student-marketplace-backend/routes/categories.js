const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Get all active categories with listing counts
router.get('/', async (req, res) => {
  try {
    // Get registered categories
    const registeredCategories = await Category.find({ active: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Get all unique categories from listings
    const usedCategories = await Listing.distinct('category');
    
    // Get listing counts for each category
    const categoryCounts = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const countMap = categoryCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Combine registered categories with counts
    const result = registeredCategories.map(cat => ({
      ...cat,
      listingCount: countMap[cat.name] || 0
    }));

    // Add unregistered categories that have listings
    const registeredNames = new Set(registeredCategories.map(c => c.name));
    const unregisteredWithListings = usedCategories
      .filter(name => !registeredNames.has(name))
      .map(name => ({
        name,
        icon: '📦',
        displayOrder: 999,
        active: true,
        isUnregistered: true,
        listingCount: countMap[name] || 0,
        aiConfig: {
          seasonalMultiplier: { Fall: 1.0, Spring: 1.0, Summer: 1.0 },
          retentionRate: 0.5,
          avgDepreciationPerMonth: 0.03
        }
      }));

    const allCategories = [...result, ...unregisteredWithListings]
      .filter(cat => cat.listingCount > 0) // Only return categories with listings
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: {
        categories: allCategories,
        total: allCategories.length,
        registered: result.length,
        unregistered: unregisteredWithListings.length
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by name (for AI pricing)
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Try to find registered category first
    let category = await Category.findOne({ name, active: true }).lean();
    
    if (!category) {
      // Check if category exists in listings
      const hasListings = await Listing.countDocuments({ category: name });
      
      if (hasListings > 0) {
        // Return default configuration for unregistered category
        category = {
          name,
          icon: '📦',
          isUnregistered: true,
          aiConfig: {
            seasonalMultiplier: { Fall: 1.0, Spring: 1.0, Summer: 1.0 },
            retentionRate: 0.5,
            avgDepreciationPerMonth: 0.03
          }
        };
      } else {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Admin: Create new category (protected route)
router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, aiConfig, description, keywords } = req.body;

    const category = new Category({
      name,
      icon: icon || '📦',
      aiConfig: aiConfig || {},
      description: description || '',
      keywords: keywords || []
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Category already exists' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Admin: Update category (protected route)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

module.exports = router;