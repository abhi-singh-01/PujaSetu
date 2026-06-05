package com.pujasetu.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otps")
public class OtpRecord {

    @Id
    private String id;

    @Indexed
    private String mobile;

    private String code;
    private Instant expiresAt;

    @Builder.Default
    private int attempts = 0;
}
