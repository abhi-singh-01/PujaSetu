const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    bookingType: {
      type: String,
      enum: ['hourly', 'half_day', 'full_day', 'multi_day'],
      required: true,
    },
    eventType: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    durationHours: Number,
    durationDays: Number,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      district: String,
      pincode: String,
      coordinates: { lat: Number, lng: Number },
    },
    specialInstructions: String,
    amount: { type: Number, required: true },
    advanceAmount: { type: Number, required: true },
    remainingAmount: { type: Number, default: 0 },
    advancePercent: { type: Number, default: 15 },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'in_progress',
        'awaiting_otp_verification',
        'ready_for_remaining_payment',
        'completed',
        'cancelled',
        'refunded',
      ],
      default: 'pending_payment',
    },
    payment: {
      advanceOrderId: String,
      advancePaymentId: String,
      advancePaid: { type: Boolean, default: false },
      remainingOrderId: String,
      remainingPaymentId: String,
      remainingPaid: { type: Boolean, default: false },
      remainingPaymentUnlocked: { type: Boolean, default: false },
      receiptNumber: String,
    },
    completionOtp: {
      code: String,
      expiresAt: Date,
      generatedAt: Date,
      customerVerified: { type: Boolean, default: false },
      providerVerified: { type: Boolean, default: false },
      customerVerifiedAt: Date,
      providerVerifiedAt: Date,
    },
    cancelledBy: { type: String, enum: ['customer', 'provider', 'admin'] },
    cancellationReason: String,
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, scheduledDate: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
