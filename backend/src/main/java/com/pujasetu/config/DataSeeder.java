package com.pujasetu.config;

import com.pujasetu.model.*;
import com.pujasetu.model.enums.*;
import com.pujasetu.repository.BookingRepository;
import com.pujasetu.repository.ProviderRepository;
import com.pujasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final AppProperties appProperties;

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            ProviderRepository providerRepository,
            BookingRepository bookingRepository
    ) {
        return args -> {
            if (!appProperties.getSeed().isEnabled()) {
                return;
            }
            if (userRepository.count() > 0) {
                log.info("Database already seeded, skipping");
                return;
            }

            User admin = userRepository.save(User.builder()
                    .mobile("9999999999")
                    .name("PujaSetu Admin")
                    .role(UserRole.ADMIN)
                    .isVerified(true)
                    .build());

            User customer = userRepository.save(User.builder()
                    .mobile("9876543210")
                    .name("Rahul Sharma")
                    .role(UserRole.CUSTOMER)
                    .location(new User.UserLocation("Maharashtra", "Mumbai City", "Mumbai", null))
                    .build());

            User panditUser = userRepository.save(User.builder()
                    .mobile("9123456780")
                    .name("Pandit Ram Shastri")
                    .role(UserRole.PANDIT)
                    .isVerified(true)
                    .build());

            User nauUser = userRepository.save(User.builder()
                    .mobile("9123456781")
                    .name("Nau Krishna Das")
                    .role(UserRole.NAI)
                    .isVerified(true)
                    .build());

            Provider pandit = providerRepository.save(Provider.builder()
                    .userId(panditUser.getId())
                    .providerType(ProviderType.PANDIT)
                    .fullName("Pandit Ram Shastri")
                    .mobile(panditUser.getMobile())
                    .experienceYears(15)
                    .languages(List.of("Hindi", "Sanskrit", "Marathi"))
                    .services(List.of("Wedding Puja", "Griha Pravesh", "Satyanarayan Katha", "Havan"))
                    .charges(new Provider.Charges(1500, 5000, 8000, 7000))
                    .servicePricing(List.of(
                            new Provider.ServicePricing("Wedding Puja", 2000, 6000, 12000, 10000),
                            new Provider.ServicePricing("Satyanarayan Katha", 1500, 5000, 8000, 7000)
                    ))
                    .location(new Provider.ProviderLocation(
                            "Maharashtra", "Mumbai City", "Mumbai",
                            new Provider.GeoPoint("Point", List.of(72.8777, 19.076))))
                    .rating(4.8)
                    .reviewCount(124)
                    .isVerified(true)
                    .verificationStatus(VerificationStatus.APPROVED)
                    .bio("Vedic scholar with 15+ years experience.")
                    .availability(List.of(new Provider.AvailabilitySlot(
                            Instant.now(), true, List.of(new Provider.TimeSlot("06:00", "20:00")))))
                    .build());

            providerRepository.save(Provider.builder()
                    .userId(nauUser.getId())
                    .providerType(ProviderType.NAI)
                    .fullName("Nau Krishna Das")
                    .mobile(nauUser.getMobile())
                    .experienceYears(12)
                    .languages(List.of("Hindi", "Marathi"))
                    .services(List.of("Mundan", "Wedding Ritual Grooming"))
                    .charges(new Provider.Charges(800, 2500, 4000, 3500))
                    .location(new Provider.ProviderLocation(
                            "Maharashtra", "Pune", "Pune",
                            new Provider.GeoPoint("Point", List.of(73.8567, 18.5204))))
                    .rating(4.6)
                    .reviewCount(89)
                    .isVerified(true)
                    .verificationStatus(VerificationStatus.APPROVED)
                    .bio("Traditional ceremony grooming specialist.")
                    .build());

            Booking.PaymentInfo payment = new Booking.PaymentInfo();
            payment.setAdvancePaid(true);
            payment.setReceiptNumber("PS-SAMPLE-001");

            bookingRepository.save(Booking.builder()
                    .customerId(customer.getId())
                    .providerId(pandit.getId())
                    .bookingType(BookingType.FULL_DAY)
                    .eventType("Satyanarayan Katha")
                    .scheduledDate(Instant.now().plus(7, ChronoUnit.DAYS))
                    .startTime("09:00")
                    .amount(8000)
                    .advancePercent(15)
                    .advanceAmount(1200)
                    .remainingAmount(6800)
                    .status(BookingStatus.CONFIRMED)
                    .payment(payment)
                    .build());

            log.info("Seed complete. Admin: {}, Customer: {}, Pandit: {}, Nau: {}",
                    admin.getMobile(), customer.getMobile(), panditUser.getMobile(), nauUser.getMobile());
        };
    }
}
