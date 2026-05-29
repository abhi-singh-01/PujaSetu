const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    isAvailable: { type: Boolean, default: true },
    slots: [{ start: String, end: String }],
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['aadhaar', 'pan', 'driving_license'], required: true },
    documentNumber: String,
    documentUrl: String,
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const providerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    providerType: { type: String, enum: ['pandit', 'nau'], required: true },
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true },
    profilePhoto: String,
    experienceYears: { type: Number, default: 0 },
    languages: [{ type: String }],
    services: [{ type: String }],
    charges: {
      hourly: { type: Number, default: 0 },
      halfDay: { type: Number, default: 0 },
      fullDay: { type: Number, default: 0 },
      multiDay: { type: Number, default: 0 },
    },
    /** Per-service custom pricing set by the provider */
    servicePricing: [
      {
        serviceName: { type: String, required: true },
        hourly: { type: Number, default: 0 },
        halfDay: { type: Number, default: 0 },
        fullDay: { type: Number, default: 0 },
        multiDay: { type: Number, default: 0 },
      },
    ],
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] },
      },
    },
    documents: [documentSchema],
    digiLockerVerified: { type: Boolean, default: false },
    digiLockerId: String,
    availability: [availabilitySlotSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
    bio: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

providerSchema.index({ 'location.coordinates': '2dsphere' });
providerSchema.index({ providerType: 1, 'location.state': 1, 'location.district': 1 });
providerSchema.index({ services: 1 });
providerSchema.index({ rating: -1 });
providerSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Provider', providerSchema);
