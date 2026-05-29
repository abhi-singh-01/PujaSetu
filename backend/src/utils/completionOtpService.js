const crypto = require('crypto');
const { COMPLETION_OTP_EXPIRY_MINUTES } = require('../config/payment');

const generateCompletionOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const buildCompletionOtpPayload = () => {
  const code = generateCompletionOtp();
  const expiresAt = new Date(Date.now() + COMPLETION_OTP_EXPIRY_MINUTES * 60 * 1000);
  return {
    code,
    expiresAt,
    generatedAt: new Date(),
    customerVerified: false,
    providerVerified: false,
  };
};

const verifyCompletionOtpCode = (booking, otp, role) => {
  const record = booking.completionOtp;
  if (!record?.code) {
    return { valid: false, message: 'Completion OTP not generated. Provider must mark service complete.' };
  }
  if (record.expiresAt < new Date()) {
    return { valid: false, message: 'Completion OTP expired. Ask provider to regenerate.' };
  }

  const devBypass =
    process.env.DEV_OTP_BYPASS === 'true' && otp === (process.env.DEV_OTP_CODE || '123456');

  if (!devBypass && record.code !== otp) {
    return { valid: false, message: 'Invalid OTP. Confirm with your service provider.' };
  }

  if (role === 'customer') {
    record.customerVerified = true;
    record.customerVerifiedAt = new Date();
  } else if (role === 'provider') {
    record.providerVerified = true;
    record.providerVerifiedAt = new Date();
  } else {
    return { valid: false, message: 'Invalid role' };
  }

  const bothVerified = record.customerVerified && record.providerVerified;
  return {
    valid: true,
    bothVerified,
    message: bothVerified
      ? 'Both parties verified. Remaining payment is now unlocked.'
      : `${role === 'customer' ? 'Customer' : 'Provider'} verified. Waiting for ${role === 'customer' ? 'provider' : 'customer'} confirmation.`,
  };
};

module.exports = { buildCompletionOtpPayload, verifyCompletionOtpCode };
