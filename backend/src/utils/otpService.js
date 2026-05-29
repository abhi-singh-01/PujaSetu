const Otp = require('../models/Otp');

const generateOtpCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpSms = async (mobile, code) => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await twilio.messages.create({
      body: `Your PujaSetu OTP is ${code}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}`,
    });
    return;
  }
  console.log(`[DEV OTP] ${mobile}: ${code}`);
};

const createAndSendOtp = async (mobile) => {
  const code =
    process.env.NODE_ENV === 'development' && process.env.DEV_OTP_BYPASS === 'true'
      ? process.env.DEV_OTP_CODE || '123456'
      : generateOtpCode();

  const expiresAt = new Date(
    Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10) * 60 * 1000
  );

  await Otp.deleteMany({ mobile });
  await Otp.create({ mobile, code, expiresAt });
  await sendOtpSms(mobile, code);

  return { expiresAt, devMode: process.env.DEV_OTP_BYPASS === 'true' };
};

const verifyOtp = async (mobile, code) => {
  const record = await Otp.findOne({ mobile }).sort({ createdAt: -1 });
  if (!record) return { valid: false, message: 'OTP not found. Request a new one.' };
  if (record.expiresAt < new Date()) return { valid: false, message: 'OTP expired' };
  if (record.attempts >= 5) return { valid: false, message: 'Too many attempts' };

  const devBypass =
    process.env.DEV_OTP_BYPASS === 'true' && code === (process.env.DEV_OTP_CODE || '123456');

  if (!devBypass && record.code !== code) {
    record.attempts += 1;
    await record.save();
    return { valid: false, message: 'Invalid OTP' };
  }

  await Otp.deleteMany({ mobile });
  return { valid: true };
};

module.exports = { createAndSendOtp, verifyOtp };
