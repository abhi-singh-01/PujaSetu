package com.pujasetu.service;

import com.pujasetu.config.AppProperties;
import com.pujasetu.exception.ApiException;
import com.pujasetu.exception.ResourceNotFoundException;
import com.pujasetu.model.Provider;
import com.pujasetu.model.User;
import com.pujasetu.model.enums.NotificationType;
import com.pujasetu.model.enums.ProviderType;
import com.pujasetu.model.enums.UserRole;
import com.pujasetu.model.enums.VerificationStatus;
import com.pujasetu.repository.ProviderRepository;
import com.pujasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    public Map<String, Object> registerProvider(User user, Provider provider) {
        if (providerRepository.findByUserId(user.getId()).isPresent()) {
            throw new ApiException("Provider profile already exists", 400);
        }

        ProviderType type = provider.getProviderType();
        if (type == null) {
            type = user.getRole() == UserRole.NAI ? ProviderType.NAI : ProviderType.PANDIT;
        }

        provider.setUserId(user.getId());
        provider.setMobile(user.getMobile());
        provider.setProviderType(type);
        provider = providerRepository.save(provider);

        user.setRole(type == ProviderType.NAI ? UserRole.NAI : UserRole.PANDIT);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("provider", enrichProvider(provider));
        return response;
    }

    public Map<String, Object> getMyProfile(String userId) {
        Provider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("provider", enrichProvider(provider));
        return response;
    }

    public Map<String, Object> updateProvider(String userId, Provider updates) {
        Provider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (updates.getFullName() != null) provider.setFullName(updates.getFullName());
        if (updates.getProfilePhoto() != null) provider.setProfilePhoto(updates.getProfilePhoto());
        if (updates.getExperienceYears() > 0) provider.setExperienceYears(updates.getExperienceYears());
        if (updates.getLanguages() != null) provider.setLanguages(updates.getLanguages());
        if (updates.getServices() != null) provider.setServices(updates.getServices());
        if (updates.getCharges() != null) provider.setCharges(updates.getCharges());
        if (updates.getServicePricing() != null) provider.setServicePricing(updates.getServicePricing());
        if (updates.getLocation() != null) provider.setLocation(updates.getLocation());
        if (updates.getAvailability() != null) provider.setAvailability(updates.getAvailability());
        if (updates.getBio() != null) provider.setBio(updates.getBio());
        if (updates.getDocuments() != null && !updates.getDocuments().isEmpty()) {
            provider.setDocuments(updates.getDocuments());
            provider.setVerificationStatus(VerificationStatus.PENDING);
        }

        provider = providerRepository.save(provider);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("provider", enrichProvider(provider));
        return response;
    }

    public Map<String, Object> searchProviders(Map<String, String> params) {
        int page = parseInt(params.getOrDefault("page", "1"), 1);
        int limit = parseInt(params.getOrDefault("limit", "20"), 20);

        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").is(true));
        query.addCriteria(Criteria.where("verificationStatus").is("approved"));

        if (params.get("providerType") != null) {
            query.addCriteria(Criteria.where("providerType").is(params.get("providerType")));
        }
        if (params.get("state") != null) {
            query.addCriteria(Criteria.where("location.state").is(params.get("state")));
        }
        if (params.get("district") != null) {
            query.addCriteria(Criteria.where("location.district").is(params.get("district")));
        }
        if (params.get("city") != null) {
            query.addCriteria(Criteria.where("location.city").regex(params.get("city"), "i"));
        }
        if (params.get("service") != null) {
            query.addCriteria(Criteria.where("services").is(params.get("service")));
        }
        if (params.get("minRating") != null) {
            query.addCriteria(Criteria.where("rating").gte(Double.parseDouble(params.get("minRating"))));
        }
        if (params.get("maxHourlyCharge") != null) {
            query.addCriteria(Criteria.where("charges.hourly").lte(Integer.parseInt(params.get("maxHourlyCharge"))));
        }
        if ("true".equals(params.get("verified"))) {
            query.addCriteria(Criteria.where("isVerified").is(true));
        }

        long total = mongoTemplate.count(query, Provider.class);
        query.with(PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "rating")));
        List<Provider> providers = mongoTemplate.find(query, Provider.class);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("providers", providers.stream().map(this::enrichProvider).toList());
        response.put("pagination", Map.of("page", page, "limit", limit, "total", total));
        return response;
    }

    public Map<String, Object> getProviderById(String id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("provider", enrichProvider(provider));
        return response;
    }

    public Map<String, Object> updatePricing(String userId, Provider updates) {
        Provider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        if (updates.getCharges() != null) provider.setCharges(updates.getCharges());
        if (updates.getServicePricing() != null) provider.setServicePricing(updates.getServicePricing());
        provider = providerRepository.save(provider);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Pricing updated successfully");
        response.put("charges", provider.getCharges());
        response.put("servicePricing", provider.getServicePricing());
        return response;
    }

    public Map<String, Object> getPricing(String userId) {
        Provider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("charges", provider.getCharges());
        response.put("servicePricing", provider.getServicePricing());
        response.put("services", provider.getServices());
        return response;
    }

    public Map<String, Object> updateAvailability(String userId, List<Provider.AvailabilitySlot> availability) {
        Provider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        provider.setAvailability(availability != null ? availability : List.of());
        provider = providerRepository.save(provider);
        return Map.of("success", true, "availability", provider.getAvailability());
    }

    public Map<String, Object> listPendingProviders() {
        List<Provider> providers = providerRepository.findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus.PENDING);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("providers", providers.stream().map(this::enrichProvider).toList());
        return response;
    }

    public Map<String, Object> approveProvider(String providerId, String status, String rejectionReason, String adminId) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        VerificationStatus verificationStatus = VerificationStatus.fromValue(status);
        provider.setVerificationStatus(verificationStatus);
        provider.setVerified(verificationStatus == VerificationStatus.APPROVED);
        if (verificationStatus == VerificationStatus.REJECTED) {
            provider.setRejectionReason(rejectionReason);
        }
        if (verificationStatus == VerificationStatus.APPROVED && provider.getDocuments() != null) {
            provider.getDocuments().forEach(doc -> {
                doc.setVerified(true);
                doc.setVerifiedAt(java.time.Instant.now());
                doc.setVerifiedBy(adminId);
            });
        }
        provider = providerRepository.save(provider);

        notificationService.createNotification(
                provider.getUserId(),
                verificationStatus == VerificationStatus.APPROVED ? "Registration Approved" : "Registration Rejected",
                verificationStatus == VerificationStatus.APPROVED
                        ? "Your PujaSetu provider profile is now live!"
                        : "Application rejected: " + (rejectionReason != null ? rejectionReason : "Contact support"),
                NotificationType.APPROVAL
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("provider", enrichProvider(provider));
        return response;
    }

    public Provider findByUserId(String userId) {
        return providerRepository.findByUserId(userId).orElse(null);
    }

    private Map<String, Object> enrichProvider(Provider provider) {
        Map<String, Object> map = new HashMap<>();
        map.put("_id", provider.getId());
        userRepository.findById(provider.getUserId()).ifPresent(u -> {
            Map<String, String> userMap = new HashMap<>();
            userMap.put("_id", u.getId());
            userMap.put("name", u.getName());
            userMap.put("mobile", u.getMobile());
            if (u.getProfilePhoto() != null) {
                userMap.put("profilePhoto", u.getProfilePhoto());
            }
            map.put("user", userMap);
        });
        map.put("providerType", provider.getProviderType());
        map.put("fullName", provider.getFullName());
        map.put("mobile", provider.getMobile());
        map.put("profilePhoto", provider.getProfilePhoto());
        map.put("experienceYears", provider.getExperienceYears());
        map.put("languages", provider.getLanguages());
        map.put("services", provider.getServices());
        map.put("charges", provider.getCharges());
        map.put("servicePricing", provider.getServicePricing());
        map.put("location", provider.getLocation());
        map.put("documents", provider.getDocuments());
        map.put("availability", provider.getAvailability());
        map.put("rating", provider.getRating());
        map.put("reviewCount", provider.getReviewCount());
        map.put("isVerified", provider.isVerified());
        map.put("verificationStatus", provider.getVerificationStatus());
        map.put("rejectionReason", provider.getRejectionReason());
        map.put("bio", provider.getBio());
        map.put("isActive", provider.isActive());
        map.put("createdAt", provider.getCreatedAt());
        map.put("updatedAt", provider.getUpdatedAt());
        return map;
    }

    private int parseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }
}
