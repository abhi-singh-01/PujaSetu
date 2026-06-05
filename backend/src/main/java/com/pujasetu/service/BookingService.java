package com.pujasetu.service;

import com.pujasetu.config.AppProperties;
import com.pujasetu.exception.ApiException;
import com.pujasetu.exception.ForbiddenException;
import com.pujasetu.exception.ResourceNotFoundException;
import com.pujasetu.mapper.BookingMapper;
import com.pujasetu.model.Booking;
import com.pujasetu.model.Provider;
import com.pujasetu.model.User;
import com.pujasetu.model.enums.BookingStatus;
import com.pujasetu.model.enums.BookingType;
import com.pujasetu.model.enums.NotificationType;
import com.pujasetu.model.enums.UserRole;
import com.pujasetu.model.enums.VerificationStatus;
import com.pujasetu.repository.BookingRepository;
import com.pujasetu.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ProviderRepository providerRepository;
    private final ProviderService providerService;
    private final PricingService pricingService;
    private final PaymentService paymentService;
    private final CompletionOtpService completionOtpService;
    private final NotificationService notificationService;
    private final BookingMapper bookingMapper;
    private final AppProperties appProperties;

    public Map<String, Object> createBooking(User user, Map<String, Object> body) {
        String providerId = (String) body.get("providerId");
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ApiException("Provider unavailable", 400));
        if (provider.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new ApiException("Provider unavailable", 400);
        }

        BookingType bookingType = BookingType.fromValue((String) body.get("bookingType"));
        String eventType = (String) body.get("eventType");
        Integer durationHours = body.get("durationHours") != null ? ((Number) body.get("durationHours")).intValue() : null;
        Integer durationDays = body.get("durationDays") != null ? ((Number) body.get("durationDays")).intValue() : null;

        int amount = pricingService.resolveBookingAmount(provider, bookingType, eventType, durationHours, durationDays);
        int advancePercent = appProperties.getPayment().getAdvancePercent();
        int advanceAmount = pricingService.calculateAdvanceAmount(amount, appProperties);
        int remainingAmount = pricingService.calculateRemainingAmount(amount, advanceAmount);

        Booking booking = Booking.builder()
                .customerId(user.getId())
                .providerId(provider.getId())
                .bookingType(bookingType)
                .eventType(eventType)
                .scheduledDate(parseInstant(body.get("scheduledDate")))
                .startTime((String) body.get("startTime"))
                .durationHours(durationHours)
                .durationDays(durationDays)
                .specialInstructions((String) body.get("specialInstructions"))
                .advancePercent(advancePercent)
                .amount(amount)
                .advanceAmount(advanceAmount)
                .remainingAmount(remainingAmount)
                .status(BookingStatus.PENDING_PAYMENT)
                .payment(new Booking.PaymentInfo())
                .build();

        booking = bookingRepository.save(booking);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("booking", bookingMapper.toResponse(booking));
        response.put("paymentSummary", Map.of(
                "total", amount,
                "advancePercent", advancePercent,
                "advanceAmount", advanceAmount,
                "remainingAmount", remainingAmount
        ));
        return response;
    }

    public Map<String, Object> createPaymentOrder(User user, String bookingId, String paymentType) {
        Booking booking = getBookingOrThrow(bookingId);
        if (!booking.getCustomerId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        if ("remaining".equals(paymentType)) {
            validateRemainingPayment(booking);
        }

        Map<String, Object> response = paymentService.createPaymentOrder(booking, paymentType);
        bookingRepository.save(booking);
        return response;
    }

    public Map<String, Object> verifyPayment(Map<String, Object> body) {
        String bookingId = (String) body.get("bookingId");
        String paymentType = (String) body.get("paymentType");
        String paymentId = (String) body.get("paymentId");
        String orderId = (String) body.get("orderId");
        String signature = (String) body.get("signature");

        Booking booking = getBookingOrThrow(bookingId);
        paymentService.verifySignature(orderId, paymentId, signature);

        if (booking.getPayment() == null) {
            booking.setPayment(new Booking.PaymentInfo());
        }

        if ("advance".equals(paymentType)) {
            booking.getPayment().setAdvancePaid(true);
            booking.getPayment().setAdvancePaymentId(paymentId);
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.getPayment().setReceiptNumber("PS-" + System.currentTimeMillis());
        } else {
            if (!booking.getPayment().isRemainingPaymentUnlocked()) {
                throw new ApiException("Completion OTP verification required before remaining payment", 400);
            }
            booking.getPayment().setRemainingPaid(true);
            booking.getPayment().setRemainingPaymentId(paymentId);
            booking.setStatus(BookingStatus.COMPLETED);
        }

        booking = bookingRepository.save(booking);
        Provider provider = providerRepository.findById(booking.getProviderId()).orElse(null);
        if (provider != null) {
            notificationService.createNotification(
                    provider.getUserId(),
                    "advance".equals(paymentType) ? "New Booking" : "Payment Received",
                    "advance".equals(paymentType)
                            ? "New " + booking.getEventType() + " booking confirmed"
                            : "Remaining payment received for " + booking.getEventType(),
                    NotificationType.PAYMENT,
                    Map.of("bookingId", booking.getId())
            );
        }
        notificationService.createNotification(
                booking.getCustomerId(),
                "Payment Successful",
                "Your " + paymentType + " payment was successful",
                NotificationType.PAYMENT,
                Map.of("bookingId", booking.getId())
        );

        return Map.of("success", true, "booking", bookingMapper.toResponse(booking));
    }

    public Map<String, Object> markServiceComplete(User user, String bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        Provider providerDoc = providerService.findByUserId(user.getId());
        if (providerDoc == null || !booking.getProviderId().equals(providerDoc.getId())) {
            throw new ForbiddenException("Only assigned provider can complete service");
        }
        if (booking.getPayment() == null || !booking.getPayment().isAdvancePaid()) {
            throw new ApiException("Advance payment not received", 400);
        }
        if (booking.getPayment().isRemainingPaid()) {
            throw new ApiException("Booking already fully paid", 400);
        }

        booking.setCompletionOtp(completionOtpService.buildCompletionOtpPayload());
        booking.setStatus(BookingStatus.AWAITING_OTP_VERIFICATION);
        booking.getPayment().setRemainingPaymentUnlocked(false);
        booking = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getCustomerId(),
                "Verify Service Completion",
                "Your provider has completed the service. Enter the OTP shared by them to unlock remaining payment.",
                NotificationType.BOOKING,
                Map.of("bookingId", booking.getId())
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Share this OTP with the customer for mutual verification");
        response.put("otpForProvider", booking.getCompletionOtp().getCode());
        response.put("expiresAt", booking.getCompletionOtp().getExpiresAt());
        response.put("booking", Map.of(
                "_id", booking.getId(),
                "status", booking.getStatus(),
                "remainingAmount", booking.getRemainingAmount()
        ));
        return response;
    }

    public Map<String, Object> verifyCompletionOtp(User user, String bookingId, String otp, String role) {
        if (!List.of("customer", "provider").contains(role)) {
            throw new ApiException("role must be customer or provider", 400);
        }

        Booking booking = getBookingOrThrow(bookingId);
        Provider providerDoc = providerService.findByUserId(user.getId());
        Access access = assertBookingAccess(booking, user, providerDoc);

        if ("customer".equals(role) && !access.isCustomer()) {
            throw new ForbiddenException("Only the customer can verify as customer");
        }
        if ("provider".equals(role) && !access.isProvider()) {
            throw new ForbiddenException("Only the assigned provider can verify as provider");
        }

        CompletionOtpService.VerifyResult result = completionOtpService.verifyCompletionOtpCode(booking, otp, role);
        if (!result.valid()) {
            throw new ApiException(result.message(), 400);
        }

        if (result.bothVerified()) {
            booking.getPayment().setRemainingPaymentUnlocked(true);
            booking.setStatus(BookingStatus.READY_FOR_REMAINING_PAYMENT);
            notificationService.createNotification(
                    booking.getCustomerId(),
                    "Pay Remaining Amount",
                    "OTP verified. Pay remaining ₹" + booking.getRemainingAmount() + " to complete booking.",
                    NotificationType.PAYMENT,
                    Map.of("bookingId", booking.getId())
            );
        }

        booking = bookingRepository.save(booking);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", result.message());
        response.put("bothVerified", result.bothVerified());
        response.put("remainingPaymentUnlocked", booking.getPayment().isRemainingPaymentUnlocked());
        response.put("completionOtp", Map.of(
                "customerVerified", booking.getCompletionOtp().isCustomerVerified(),
                "providerVerified", booking.getCompletionOtp().isProviderVerified(),
                "expiresAt", booking.getCompletionOtp().getExpiresAt()
        ));
        response.put("booking", bookingMapper.toResponse(booking));
        return response;
    }

    public Map<String, Object> getCompletionOtpStatus(User user, String bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        Provider providerDoc = providerService.findByUserId(user.getId());
        Access access = assertBookingAccess(booking, user, providerDoc);
        if (!access.allowed()) {
            throw new ForbiddenException("Access denied");
        }

        Map<String, Object> completionOtp = null;
        if (booking.getCompletionOtp() != null) {
            completionOtp = new HashMap<>();
            completionOtp.put("expiresAt", booking.getCompletionOtp().getExpiresAt());
            completionOtp.put("customerVerified", booking.getCompletionOtp().isCustomerVerified());
            completionOtp.put("providerVerified", booking.getCompletionOtp().isProviderVerified());
            if (providerDoc != null && booking.getProviderId().equals(providerDoc.getId())
                    && booking.getCompletionOtp().getCode() != null) {
                completionOtp.put("code", booking.getCompletionOtp().getCode());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("status", booking.getStatus());
        response.put("remainingPaymentUnlocked", booking.getPayment() != null && booking.getPayment().isRemainingPaymentUnlocked());
        response.put("completionOtp", completionOtp);
        response.put("paymentSummary", Map.of(
                "advancePercent", booking.getAdvancePercent(),
                "advanceAmount", booking.getAdvanceAmount(),
                "remainingAmount", booking.getRemainingAmount(),
                "advancePaid", booking.getPayment() != null && booking.getPayment().isAdvancePaid(),
                "remainingPaid", booking.getPayment() != null && booking.getPayment().isRemainingPaid()
        ));
        return response;
    }

    public Map<String, Object> getMyBookings(User user) {
        List<Booking> bookings;
        if (user.getRole() == UserRole.ADMIN) {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc(
                    org.springframework.data.domain.PageRequest.of(0, 100)).getContent();
        } else if (user.getRole() == UserRole.PANDIT || user.getRole() == UserRole.NAI) {
            Provider provider = providerService.findByUserId(user.getId());
            if (provider == null) {
                return Map.of("success", true, "bookings", List.of());
            }
            bookings = bookingRepository.findByProviderIdOrderByCreatedAtDesc(provider.getId());
        } else {
            bookings = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());
        }

        return Map.of("success", true, "bookings", bookings.stream().map(bookingMapper::toResponse).toList());
    }

    public Map<String, Object> getBookingById(User user, String bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        Provider providerDoc = providerService.findByUserId(user.getId());
        if (!assertBookingAccess(booking, user, providerDoc).allowed()) {
            throw new ForbiddenException("Access denied");
        }
        return Map.of("success", true, "booking", bookingMapper.toResponse(booking));
    }

    public Map<String, Object> updateBookingStatus(User user, String bookingId, String status) {
        if (!List.of("in_progress", "cancelled").contains(status)) {
            throw new ApiException("Invalid status transition", 400);
        }

        Booking booking = getBookingOrThrow(bookingId);
        Provider providerDoc = providerService.findByUserId(user.getId());
        Access access = assertBookingAccess(booking, user, providerDoc);
        if (!access.isProvider() && !access.isAdmin()) {
            throw new ForbiddenException("Access denied");
        }

        booking.setStatus(BookingStatus.fromValue(status));
        booking = bookingRepository.save(booking);
        return Map.of("success", true, "booking", bookingMapper.toResponse(booking));
    }

    private void validateRemainingPayment(Booking booking) {
        if (booking.getPayment() == null || !booking.getPayment().isAdvancePaid()) {
            throw new ApiException("Advance payment required first", 400);
        }
        if (!booking.getPayment().isRemainingPaymentUnlocked()) {
            throw new ApiException(
                    "Remaining payment locked. Both customer and provider must verify the completion OTP after service.",
                    400
            );
        }
        if (booking.getPayment().isRemainingPaid()) {
            throw new ApiException("Remaining amount already paid", 400);
        }
    }

    private Booking getBookingOrThrow(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private record Access(boolean isCustomer, boolean isProvider, boolean isAdmin, boolean allowed) {}

    private Access assertBookingAccess(Booking booking, User user, Provider providerDoc) {
        boolean isCustomer = booking.getCustomerId().equals(user.getId());
        boolean isProvider = providerDoc != null && booking.getProviderId().equals(providerDoc.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        return new Access(isCustomer, isProvider, isAdmin, isCustomer || isProvider || isAdmin);
    }

    private Instant parseInstant(Object value) {
        if (value == null) return null;
        if (value instanceof Instant instant) return instant;
        return Instant.parse(value.toString());
    }
}
