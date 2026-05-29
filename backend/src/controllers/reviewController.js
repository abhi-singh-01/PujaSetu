const Review = require('../models/Review');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.customer.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid booking' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Booking must be completed' });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      provider: booking.provider,
      rating,
      comment,
    });

    const reviews = await Review.find({ provider: booking.provider });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Provider.findByIdAndUpdate(booking.provider, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

exports.getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId, isReported: false })
      .populate('customer', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

exports.reportReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.isReported = true;
    review.reportReason = req.body.reason;
    await review.save();
    res.json({ success: true, message: 'Review reported' });
  } catch (err) {
    next(err);
  }
};
