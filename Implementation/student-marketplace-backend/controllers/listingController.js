const Listing = require("../models/Listing");

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const { title, description, price, category, photo, imageUrl, cloudinaryId } = req.body;
    
    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      photo: photo || null, // Legacy base64 support
      imageUrl: imageUrl || null, // New Cloudinary URL
      cloudinaryId: cloudinaryId || null, // Cloudinary public ID for deletion
      seller: req.user.id // This comes from auth middleware
    });
    
    // Populate seller info for response
    await listing.populate('seller', 'name email campus');
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all listings
exports.getAllListings = async (req, res) => {
  try {
    const { category, campus } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    
    const listings = await Listing.find(filter)
      .populate('seller', 'name email campus')
      .sort({ createdAt: -1 });
    
    // Filter by campus if specified
    let filteredListings = listings;
    if (campus) {
      filteredListings = listings.filter(listing => 
        listing.seller.campus === campus
      );
    }
    
    res.json(filteredListings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email campus');
    
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a listing
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    // Check if user owns the listing - ensure both are strings for comparison
    if (!listing.seller || listing.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this listing" });
    }
    
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'name email campus');
    
    res.json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    // Check if user owns the listing - ensure both are strings for comparison
    if (!listing.seller || listing.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this listing" });
    }
    
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's own listings
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id })
      .populate('seller', 'name email campus')
      .sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
