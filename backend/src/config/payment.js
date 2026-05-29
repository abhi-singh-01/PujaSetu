/** Advance booking deposit as fraction of total (default 15%) */
const ADVANCE_PERCENT = parseFloat(process.env.ADVANCE_PAYMENT_PERCENT || '15') / 100;

const COMPLETION_OTP_EXPIRY_MINUTES = parseInt(process.env.COMPLETION_OTP_EXPIRY_MINUTES || '30', 10);

const calculateAdvanceAmount = (totalAmount) => Math.round(totalAmount * ADVANCE_PERCENT);

const calculateRemainingAmount = (totalAmount, advanceAmount) => totalAmount - advanceAmount;

module.exports = {
  ADVANCE_PERCENT,
  COMPLETION_OTP_EXPIRY_MINUTES,
  calculateAdvanceAmount,
  calculateRemainingAmount,
};
