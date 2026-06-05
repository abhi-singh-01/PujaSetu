package com.pujasetu.service;

import com.pujasetu.config.AppProperties;
import com.pujasetu.exception.ApiException;
import com.pujasetu.model.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final AppProperties appProperties;

    public Map<String, Object> createPaymentOrder(Booking booking, String paymentType) {
        int amount = "remaining".equals(paymentType) ? booking.getRemainingAmount() : booking.getAdvanceAmount();
        int amountPaise = amount * 100;

        if (appProperties.getRazorpay().getKeyId() == null || appProperties.getRazorpay().getKeyId().isBlank()) {
            String mockOrderId = "order_mock_" + System.currentTimeMillis();
            if (booking.getPayment() == null) {
                booking.setPayment(new Booking.PaymentInfo());
            }
            if ("remaining".equals(paymentType)) {
                booking.getPayment().setRemainingOrderId(mockOrderId);
            } else {
                booking.getPayment().setAdvanceOrderId(mockOrderId);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mock", true);
            response.put("order", Map.of("id", mockOrderId, "amount", amountPaise, "currency", "INR"));
            response.put("key", "mock_key");
            response.put("bookingId", booking.getId());
            response.put("paymentType", paymentType);
            return response;
        }

        String orderId = "order_" + System.currentTimeMillis();
        if (booking.getPayment() == null) {
            booking.setPayment(new Booking.PaymentInfo());
        }
        if ("remaining".equals(paymentType)) {
            booking.getPayment().setRemainingOrderId(orderId);
        } else {
            booking.getPayment().setAdvanceOrderId(orderId);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", Map.of("id", orderId, "amount", amountPaise, "currency", "INR"));
        response.put("key", appProperties.getRazorpay().getKeyId());
        response.put("bookingId", booking.getId());
        response.put("paymentType", paymentType);
        return response;
    }

    public void verifySignature(String orderId, String paymentId, String signature) {
        if (appProperties.getRazorpay().getKeySecret() == null || appProperties.getRazorpay().getKeySecret().isBlank()) {
            return;
        }
        if (signature == null || signature.isBlank()) {
            return;
        }
        try {
            String body = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appProperties.getRazorpay().getKeySecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
            if (!expected.equals(signature)) {
                throw new ApiException("Invalid payment signature", 400);
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException("Payment verification failed", 400);
        }
    }
}
