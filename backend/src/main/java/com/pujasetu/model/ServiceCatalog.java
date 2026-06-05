package com.pujasetu.model;

import com.pujasetu.model.enums.ProviderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "services")
public class ServiceCatalog {

    @Id
    private String id;

    private String name;
    private String description;
    private ProviderType providerType;

    @Builder.Default
    private boolean isActive = true;
}
