const Report = require("../models/Report");
const Listing = require("../models/Listing");
const User = require("../models/User");

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { listingId, reason, description } = req.body;
    const reporterId = req.user.id;

    // Check if listing exists
    const listing = await Listing.findById(listingId).populate('seller');
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Prevent users from reporting their own listings
    if (listing.seller._id.toString() === reporterId) {
      return res.status(400).json({ success: false, error: 'Cannot report your own listing' });
    }

    // Check if user already reported this listing
    const existingReport = await Report.findOne({
      listing: listingId,
      reporter: reporterId
    });

    if (existingReport) {
      return res.status(400).json({ success: false, error: 'You have already reported this listing' });
    }

    // Create report
    const report = await Report.create({
      listing: listingId,
      reporter: reporterId,
      reportedUser: listing.seller._id,
      reason,
      description: description || null
    });

    // Increment report count for the reported user
    await User.findByIdAndUpdate(listing.seller._id, {
      $inc: { reportCount: 1 }
    });

    // Populate report for response
    await report.populate([
      { path: 'listing', select: 'title' },
      { path: 'reporter', select: 'name' },
      { path: 'reportedUser', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit report' });
  }
};

// Get user's reports (reports they've made)
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await Report.find({ reporter: userId })
      .populate('listing', 'title price')
      .populate('reportedUser', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
};