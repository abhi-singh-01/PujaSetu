package com.pujasetu.mapper;

import com.pujasetu.model.Booking;
import com.pujasetu.model.Provider;
import com.pujasetu.model.User;
import com.pujasetu.repository.ProviderRepository;
import com.pujasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;

    public Map<String, Object> toResponse(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("_id", booking.getId());
        map.put("customer", enrichCustomer(booking.getCustomerId()));
        map.put("provider", enrichProvider(booking.getProviderId()));
        map.put("bookingType", booking.getBookingType());
        map.put("eventType", booking.getEventType());
        map.put("scheduledDate", booking.getScheduledDate());
        map.put("startTime", booking.getStartTime());
        map.put("durationHours", booking.getDurationHours());
        map.put("durationDays", booking.getDurationDays());
        map.put("address", booking.getAddress());
        map.put("specialInstructions", booking.getSpecialInstructions());
        map.put("amount", booking.getAmount());
        map.put("advanceAmount", booking.getAdvanceAmount());
        map.put("remainingAmount", booking.getRemainingAmount());
        map.put("advancePercent", booking.getAdvancePercent());
        map.put("status", booking.getStatus());
        map.put("payment", booking.getPayment());
        map.put("completionOtp", booking.getCompletionOtp());
        map.put("cancelledBy", booking.getCancelledBy());
        map.put("cancellationReason", booking.getCancellationReason());
        map.put("createdAt", booking.getCreatedAt());
        map.put("updatedAt", booking.getUpdatedAt());
        return map;
    }

    private Object enrichCustomer(String customerId) {
        return userRepository.findById(customerId)
                .<Object>map(u -> {
                    Map<String, String> customer = new HashMap<>();
                    customer.put("_id", u.getId());
                    customer.put("name", u.getName());
                    customer.put("mobile", u.getMobile());
                    return customer;
                })
                .orElse(customerId);
    }

    private Object enrichProvider(String providerId) {
        return providerRepository.findById(providerId)
                .<Object>map(p -> {
                    Map<String, Object> providerMap = new HashMap<>();
                    providerMap.put("_id", p.getId());
                    providerMap.put("fullName", p.getFullName());
                    providerMap.put("providerType", p.getProviderType());
                    userRepository.findById(p.getUserId()).ifPresent(u -> {
                        Map<String, String> userMap = new HashMap<>();
                        userMap.put("_id", u.getId());
                        userMap.put("name", u.getName());
                        providerMap.put("user", userMap);
                    });
                    return providerMap;
                })
                .orElse(providerId);
    }
}
