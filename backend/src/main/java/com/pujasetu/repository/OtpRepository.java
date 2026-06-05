package com.pujasetu.repository;

import com.pujasetu.model.OtpRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OtpRepository extends MongoRepository<OtpRecord, String> {

    List<OtpRecord> findByMobileOrderByExpiresAtDesc(String mobile);

    void deleteByMobile(String mobile);
}
