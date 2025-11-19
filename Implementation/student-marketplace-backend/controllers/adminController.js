const User = require("../models/User");
const Report = require("../models/Report");
const Listing = require("../models/Listing");

// Get all reports for admin dashboard
exports.getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    console.log('📊 Getting reports with filter:', filter);

    const reports = await Report.find(filter)
      .populate('listing', 'title price category description imageUrl photo')
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email campus reportCount')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReports = await Report.countDocuments(filter);

    console.log(`✅ Found ${reports.length} reports with status: ${status || 'all'}`);

    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit),
        totalReports
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
};

// Get users with reports for admin management
exports.getUsersWithReports = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get users who have been reported (have reportCount > 0)
    const users = await User.find({ 
      reportCount: { $gt: 0 },
      role: { $ne: 'admin' } // Exclude admin users
    })
      .select('name email campus reportCount isSuspended suspendedUntil isActive createdAt')
      .sort({ reportCount: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments({ 
      reportCount: { $gt: 0 },
      role: { $ne: 'admin' }
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers
      }
    });
  } catch (error) {
    console.error('Get users with reports error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

// Update report status and take action
exports.updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, actionTaken, adminNotes } = req.body;
    const adminId = req.user.id;

    console.log(`🔄 Updating report ${reportId} with status: ${status}, action: ${actionTaken}`);

    const report = await Report.findById(reportId)
      .populate('listing')
      .populate('reportedUser');

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    console.log(`📝 Current report status: ${report.status} -> New status: ${status}`);

    // Check if report was previously pending and is now being dismissed
    const wasPending = report.status === 'pending';
    const isBeingDismissed = status === 'dismissed';
    
    // Update report
    report.status = status || report.status;
    report.actionTaken = actionTaken || report.actionTaken;
    report.adminNotes = adminNotes || report.adminNotes;
    report.reviewedBy = adminId;
    report.reviewedAt = new Date();

    await report.save();

    console.log(`✅ Report ${reportId} updated successfully to status: ${report.status}`);

    // Handle report count for dismissed reports
    if (wasPending && isBeingDismissed && report.reportedUser) {
      // Decrement report count when dismissing a pending report
      await User.findByIdAndUpdate(report.reportedUser._id, {
        $inc: { reportCount: -1 }
      });
      console.log(`📉 Decremented report count for user ${report.reportedUser._id} due to dismissal`);
    }

    // Take action based on actionTaken
    if (actionTaken === 'listing_removed' && report.listing) {
      await Listing.findByIdAndDelete(report.listing._id);
      console.log(`🗑️ Listing ${report.listing._id} deleted`);
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ success: false, error: 'Failed to update report' });
  }
};

// Suspend or ban user
exports.moderateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, duration, reason } = req.body; // action: 'suspend', 'ban', 'activate'
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot moderate admin users' });
    }

    switch (action) {
      case 'suspend':
        const suspendUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        user.isSuspended = true;
        user.suspendedUntil = suspendUntil;
        user.suspensionReason = reason;
        break;
      
      case 'ban':
        user.isActive = false;
        user.isSuspended = true;
        user.suspensionReason = reason;
        break;
      
      case 'activate':
        user.isActive = true;
        user.isSuspended = false;
        user.suspendedUntil = null;
        user.suspensionReason = null;
        break;
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${action}ed successfully`,
      data: user
    });
  } catch (error) {
    console.error('Moderate user error:', error);
    res.status(500).json({ success: false, error: 'Failed to moderate user' });
  }
};

// Delete listing (admin action)
exports.deleteListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { reason } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    await Listing.findByIdAndDelete(listingId);

    // Update any related reports
    await Report.updateMany(
      { listing: listingId },
      { 
        actionTaken: 'listing_removed',
        status: 'resolved',
        adminNotes: reason || 'Listing removed by admin',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete listing' });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalReports,
      pendingReports,
      totalUsers,
      suspendedUsers,
      totalListings
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      // Count all users, excluding admins (handles both old and new user formats)
      User.countDocuments({ 
        $or: [
          { role: 'user' },           // New users with role field
          { role: { $exists: false } } // Old users without role field
        ]
      }),
      // Count suspended users (only applies to new users with the field)
      User.countDocuments({ isSuspended: true }),
      Listing.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        totalUsers,
        suspendedUsers,
        totalListings
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard stats' });
  }
};