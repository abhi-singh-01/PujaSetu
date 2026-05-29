const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: {
      type: String,
      enum: ['customer', 'pandit', 'nau', 'admin'],
      default: 'customer',
    },
    profilePhoto: { type: String },
    isVerified: { type: Boolean, default: false },
    fcmToken: { type: String },
    location: {
      state: String,
      district: String,
      city: String,
      coordinates: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
      },
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1, 'location.state': 1, 'location.district': 1 });

module.exports = mongoose.model('User', userSchema);
