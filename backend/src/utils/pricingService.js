/**
 * Resolves booking amount from provider charges and optional per-service pricing.
 */
const resolveBookingAmount = (provider, { bookingType, eventType, durationHours, durationDays }) => {
  const servicePrice = provider.servicePricing?.find(
    (s) => s.serviceName === eventType || s.serviceName?.toLowerCase() === eventType?.toLowerCase()
  );

  const charges = servicePrice
    ? {
        hourly: servicePrice.hourly ?? provider.charges.hourly,
        halfDay: servicePrice.halfDay ?? provider.charges.halfDay,
        fullDay: servicePrice.fullDay ?? provider.charges.fullDay,
        multiDay: servicePrice.multiDay ?? provider.charges.multiDay,
      }
    : provider.charges;

  switch (bookingType) {
    case 'hourly':
      return (charges.hourly || 0) * (durationHours || 1);
    case 'half_day':
      return charges.halfDay || (charges.hourly || 0) * 4;
    case 'full_day':
      return charges.fullDay || (charges.hourly || 0) * 8;
    case 'multi_day':
      return (charges.multiDay || charges.fullDay || 0) * (durationDays || 1);
    default:
      return charges.hourly || 0;
  }
};

module.exports = { resolveBookingAmount };
