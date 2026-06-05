package com.pujasetu.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pujasetu.model.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed
    @Field("user")
    private String userId;

    private String title;
    private String body;

    @Builder.Default
    private NotificationType type = NotificationType.GENERAL;

    private Map<String, Object> data;

    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    private Instant createdAt;
}
