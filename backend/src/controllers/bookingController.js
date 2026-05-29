const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const getRazorpay = require('../config/razorpay');
const {
  ADVANCE_PERCENT,
  calculateAdvanceAmount,
  calculateRemainingAmount,
} = require('../config/payment');
const { resolveBookingAmount } = require('../utils/pricingService');
const {
  buildCompletionOtpPayload,
  verifyCompletionOtpCode,
} = require('../utils/completionOtpService');
const { createNotification } = require('../utils/notificationService');

const getProviderForUser = async (userId) => Provider.findOne({ user: userId });

const assertBookingAccess = (booking, user, providerDoc) => {
  const isCustomer = booking.customer.toString() === user._id.toString();
  const isProvider = providerDoc && booking.provider.toString() === providerDoc._id.toString();
  const isAdmin = user.role === 'admin';
  return { isCustomer, isProvider, isAdmin, allowed: isCustomer || isProvider || isAdmin };
};

exports.createBooking = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.body.providerId);
    if (!provider || provider.verificationStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Provider unavailable' });
    }

    const amount = resolveBookingAmount(provider, {
      bookingType: req.body.bookingType,
      eventType: req.body.eventType,
      durationHours: req.body.durationHours,
      durationDays: req.body.durationDays,
    });

    const advancePercent = Math.round(ADVANCE_PERCENT * 100);
    const advanceAmount = calculateAdvanceAmount(amount);
    const remainingAmount = calculateRemainingAmount(amount, advanceAmount);

    const booking = await Booking.create({
      customer: req.user._id,
      provider: provider._id,
      bookingType: req.body.bookingType,
      eventType: req.body.eventType,
      scheduledDate: req.body.scheduledDate,
      startTime: req.body.startTime,
      durationHours: req.body.durationHours,
      durationDays: req.body.durationDays,
      address: req.body.address,
      specialInstructions: req.body.specialInstructions,
      amount,
      advanceAmount,
      remainingAmount,
      advancePercent,
      status: 'pending_payment',
    });

    res.status(201).json({
      success: true,
      booking,
      paymentSummary: {
        total: amount,
        advancePercent,
        advanceAmount,
        remainingAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { paymentType = 'advance' } = req.body;

    if (paymentType === 'remaining') {
      if (!booking.payment.advancePaid) {
        return res.status(400).json({ success: false, message: 'Advance payment required first' });
      }
      if (!booking.payment.remainingPaymentUnlocked) {
        return res.status(400).json({
          success: false,
          message:
            'Remaining payment locked. Both customer and provider must verify the completion OTP after service.',
        });
      }
      if (booking.payment.remainingPaid) {
        return res.status(400).json({ success: false, message: 'Remaining amount already paid' });
      }
    }

    const amount = paymentType === 'advance' ? booking.advanceAmount : booking.remainingAmount;
    const amountPaise = amount * 100;

    const razorpay = getRazorpay();
    if (!razorpay) {
      const mockOrderId = `order_mock_${Date.now()}`;
      if (paymentType === 'advance') booking.payment.advanceOrderId = mockOrderId;
      else booking.payment.remainingOrderId = mockOrderId;
      await booking.save();
      return res.json({
        success: true,
        mock: true,
        order: { id: mockOrderId, amount: amountPaise, currency: 'INR' },
        key: 'mock_key',
        bookingId: booking._id,
        paymentType,
      });
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `booking_${booking._id}_${paymentType}`,
    });

    if (paymentType === 'advance') booking.payment.advanceOrderId = order.id;
    else booking.payment.remainingOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
      paymentType,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentType, paymentId, orderId, signature } = req.body;
    const booking = await Booking.findById(bookingId).populate('provider');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const razorpay = getRazorpay();
    if (razorpay && signature) {
      const crypto = require('crypto');
      const body = `${orderId}|${paymentId}`;
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
      if (expected !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    }

    if (paymentType === 'advance') {
      booking.payment.advancePaid = true;
      booking.payment.advancePaymentId = paymentId;
      booking.status = 'confirmed';
      booking.payment.receiptNumber = `PS-${Date.now()}`;
    } else {
      if (!booking.payment.remainingPaymentUnlocked) {
        return res.status(400).json({
          success: false,
          message: 'Completion OTP verification required before remaining payment',
        });
      }
      booking.payment.remainingPaid = true;
      booking.payment.remainingPaymentId = paymentId;
      booking.status = 'completed';
    }

    await booking.save();

    const provider = await Provider.findById(booking.provider);
    await createNotification(
      provider.user,
      paymentType === 'advance' ? 'New Booking' : 'Payment Received',
      paymentType === 'advance'
        ? `New ${booking.eventType} booking confirmed`
        : `Remaining payment received for ${booking.eventType}`,
      'payment',
      { bookingId: booking._id }
    );
    await createNotification(
      booking.customer,
      'Payment Successful',
      `Your ${paymentType} payment was successful`,
      'payment',
      { bookingId: booking._id }
    );

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

/** Provider marks service complete and shares OTP with customer */
exports.markServiceComplete = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const providerDoc = await getProviderForUser(req.user._id);
    if (!providerDoc || booking.provider.toString() !== providerDoc._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only assigned provider can complete service' });
    }
    if (!booking.payment.advancePaid) {
      return res.status(400).json({ success: false, message: 'Advance payment not received' });
    }
    if (booking.payment.remainingPaid) {
      return res.status(400).json({ success: false, message: 'Booking already fully paid' });
    }

    booking.completionOtp = buildCompletionOtpPayload();
    booking.status = 'awaiting_otp_verification';
    booking.payment.remainingPaymentUnlocked = false;
    await booking.save();

    await createNotification(
      booking.customer,
      'Verify Service Completion',
      'Your provider has completed the service. Enter the OTP shared by them to unlock remaining payment.',
      'booking',
      { bookingId: booking._id }
    );

    res.json({
      success: true,
      message: 'Share this OTP with the customer for mutual verification',
      otpForProvider: booking.completionOtp.code,
      expiresAt: booking.completionOtp.expiresAt,
      booking: {
        _id: booking._id,
        status: booking.status,
        remainingAmount: booking.remainingAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** Customer or provider verifies completion OTP (both required to unlock payment) */
exports.verifyCompletionOtp = async (req, res, next) => {
  try {
    const { otp, role } = req.body;
    if (!['customer', 'provider'].includes(role)) {
      return res.status(400).json({ success: false, message: 'role must be customer or provider' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const providerDoc = await getProviderForUser(req.user._id);
    const { isCustomer, isProvider } = assertBookingAccess(booking, req.user, providerDoc);

    if (role === 'customer' && !isCustomer) {
      return res.status(403).json({ success: false, message: 'Only the customer can verify as customer' });
    }
    if (role === 'provider' && !isProvider) {
      return res.status(403).json({ success: false, message: 'Only the assigned provider can verify as provider' });
    }

    const result = verifyCompletionOtpCode(booking, otp, role);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    if (result.bothVerified) {
      booking.payment.remainingPaymentUnlocked = true;
      booking.status = 'ready_for_remaining_payment';
      await createNotification(
        booking.customer,
        'Pay Remaining Amount',
        `OTP verified. Pay remaining ₹${booking.remainingAmount} to complete booking.`,
        'payment',
        { bookingId: booking._id }
      );
    }

    await booking.save();

    res.json({
      success: true,
      message: result.message,
      bothVerified: result.bothVerified,
      remainingPaymentUnlocked: booking.payment.remainingPaymentUnlocked,
      completionOtp: {
        customerVerified: booking.completionOtp.customerVerified,
        providerVerified: booking.completionOtp.providerVerified,
        expiresAt: booking.completionOtp.expiresAt,
      },
      booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCompletionOtpStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const providerDoc = await getProviderForUser(req.user._id);
    const { allowed } = assertBookingAccess(booking, req.user, providerDoc);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({
      success: true,
      status: booking.status,
      remainingPaymentUnlocked: booking.payment.remainingPaymentUnlocked,
      completionOtp: booking.completionOtp
        ? {
            expiresAt: booking.completionOtp.expiresAt,
            customerVerified: booking.completionOtp.customerVerified,
            providerVerified: booking.completionOtp.providerVerified,
            ...(providerDoc &&
            booking.provider.toString() === providerDoc._id.toString() &&
            booking.completionOtp.code
              ? { code: booking.completionOtp.code }
              : {}),
          }
        : null,
      paymentSummary: {
        advancePercent: booking.advancePercent,
        advanceAmount: booking.advanceAmount,
        remainingAmount: booking.remainingAmount,
        advancePaid: booking.payment.advancePaid,
        remainingPaid: booking.payment.remainingPaid,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    let query = Booking.find({ customer: req.user._id })
      .populate('customer', 'name mobile')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    if (['pandit', 'nau'].includes(req.user.role)) {
      const provider = await getProviderForUser(req.user._id);
      if (!provider) return res.json({ success: true, bookings: [] });
      query = Booking.find({ provider: provider._id })
        .populate('customer', 'name mobile')
        .populate({ path: 'provider', select: 'fullName providerType' })
        .sort({ createdAt: -1 });
    }

    if (req.user.role === 'admin') {
      query = Booking.find()
        .populate('customer', 'name mobile')
        .populate({ path: 'provider', select: 'fullName providerType' })
        .sort({ createdAt: -1 })
        .limit(100);
    }

    const bookings = await query;
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name mobile')
      .populate({ path: 'provider', populate: { path: 'user' } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const providerDoc = await getProviderForUser(req.user._id);
    const { allowed } = assertBookingAccess(booking, req.user, providerDoc);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const allowedStatuses = ['in_progress', 'cancelled'];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status transition' });
    }

    const providerDoc = await getProviderForUser(req.user._id);
    const { isProvider, isAdmin } = assertBookingAccess(booking, req.user, providerDoc);
    if (!isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    booking.status = req.body.status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};
