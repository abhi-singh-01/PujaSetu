const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProviders,
      pendingProviders,
      totalBookings,
      confirmedBookings,
      completedBookings,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Provider.countDocuments({ verificationStatus: 'approved' }),
      Provider.countDocuments({ verificationStatus: 'pending' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.aggregate([
        { $match: { 'payment.advancePaid': true } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        pendingProviders,
        totalBookings,
        confirmedBookings,
        completedBookings,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name mobile')
      .populate({ path: 'provider', select: 'fullName providerType' })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
