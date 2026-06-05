package com.pujasetu.service;

import com.pujasetu.config.AppProperties;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class CloudinaryService {

    private final Optional<Cloudinary> cloudinary;

    public CloudinaryService(AppProperties appProperties) {
        var cfg = appProperties.getCloudinary();
        if (cfg.getCloudName() != null && !cfg.getCloudName().isBlank()) {
            this.cloudinary = Optional.of(new Cloudinary(Map.of(
                    "cloud_name", cfg.getCloudName(),
                    "api_key", cfg.getApiKey(),
                    "api_secret", cfg.getApiSecret()
            )));
        } else {
            this.cloudinary = Optional.empty();
        }
    }

    public String upload(MultipartFile file, String folder) {
        if (cloudinary.isEmpty()) {
            log.warn("Cloudinary not configured; returning placeholder URL");
            return "https://placeholder.pujasetu.local/" + folder + "/" + file.getOriginalFilename();
        }
        try {
            Map uploadResult = cloudinary.get().uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "pujasetu/" + folder));
            return uploadResult.get("secure_url").toString();
        } catch (Exception ex) {
            throw new com.pujasetu.exception.ApiException("Upload failed: " + ex.getMessage(), 500);
        }
    }
}
