package com.pujasetu.repository;

import com.pujasetu.model.ServiceCatalog;
import com.pujasetu.model.enums.ProviderType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ServiceCatalogRepository extends MongoRepository<ServiceCatalog, String> {

    List<ServiceCatalog> findByProviderTypeAndIsActiveTrue(ProviderType providerType);
}
