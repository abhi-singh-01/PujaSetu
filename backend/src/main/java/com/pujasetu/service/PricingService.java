package com.pujasetu.service;

import com.pujasetu.config.AppProperties;
import com.pujasetu.model.Provider;
import com.pujasetu.model.enums.BookingType;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

    public int resolveBookingAmount(Provider provider, BookingType bookingType, String eventType,
                                    Integer durationHours, Integer durationDays) {
        Provider.Charges charges = resolveCharges(provider, eventType);

        return switch (bookingType) {
            case HOURLY -> (charges.getHourly()) * (durationHours != null ? durationHours : 1);
            case HALF_DAY -> charges.getHalfDay() > 0 ? charges.getHalfDay() : charges.getHourly() * 4;
            case FULL_DAY -> charges.getFullDay() > 0 ? charges.getFullDay() : charges.getHourly() * 8;
            case MULTI_DAY -> {
                int dayRate = charges.getMultiDay() > 0 ? charges.getMultiDay() : charges.getFullDay();
                yield dayRate * (durationDays != null ? durationDays : 1);
            }
        };
    }

    public int calculateAdvanceAmount(int totalAmount, AppProperties appProperties) {
        return (int) Math.round(totalAmount * appProperties.getPayment().getAdvancePercent() / 100.0);
    }

    public int calculateRemainingAmount(int totalAmount, int advanceAmount) {
        return totalAmount - advanceAmount;
    }

    private Provider.Charges resolveCharges(Provider provider, String eventType) {
        if (provider.getServicePricing() != null && eventType != null) {
            for (Provider.ServicePricing sp : provider.getServicePricing()) {
                if (sp.getServiceName().equalsIgnoreCase(eventType)) {
                    return new Provider.Charges(sp.getHourly(), sp.getHalfDay(), sp.getFullDay(), sp.getMultiDay());
                }
            }
        }
        return provider.getCharges() != null ? provider.getCharges() : new Provider.Charges(0, 0, 0, 0);
    }
}
