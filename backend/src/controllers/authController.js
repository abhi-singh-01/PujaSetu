const { body } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { createAndSendOtp, verifyOtp } = require('../utils/otpService');

exports.sendOtpValidation = [
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile required'),
];

exports.verifyOtpValidation = [
  body('mobile').matches(/^[6-9]\d{9}$/),
  body('otp').isLength({ min: 4, max: 6 }),
  body('name').optional().trim(),
  body('role').optional().isIn(['customer', 'pandit', 'nau']),
];

exports.sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    const result = await createAndSendOtp(mobile);
    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresAt: result.expiresAt,
      ...(result.devMode && { hint: 'Dev mode: use OTP 123456' }),
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp, name, role } = req.body;
    const verification = await verifyOtp(mobile, otp);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({
        mobile,
        name: name || `User ${mobile.slice(-4)}`,
        role: role || 'customer',
      });
    } else if (name) {
      user.name = name;
      if (role && role !== 'admin') user.role = role;
      await user.save();
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
        profilePhoto: user.profilePhoto,
        location: user.location,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  const u = req.user.toObject ? req.user.toObject() : req.user;
  res.json({
    success: true,
    user: {
      id: u._id,
      mobile: u.mobile,
      name: u.name,
      role: u.role,
      profilePhoto: u.profilePhoto,
      location: u.location,
      isVerified: u.isVerified,
    },
  });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'profilePhoto', 'location', 'fcmToken'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) req.user[key] = req.body[key];
    });
    await req.user.save();
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.digiLockerAuthUrl = (req, res) => {
  const clientId = process.env.DIGILOCKER_CLIENT_ID;
  if (!clientId) {
    return res.status(503).json({
      success: false,
      message: 'DigiLocker not configured',
    });
  }
  const redirect = encodeURIComponent(process.env.DIGILOCKER_REDIRECT_URI);
  const url = `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirect}&state=${req.user._id}`;
  res.json({ success: true, url });
};

exports.digiLockerCallback = async (req, res) => {
  res.send('<html><body><h2>DigiLocker verification received. You may close this window.</h2></body></html>');
};
