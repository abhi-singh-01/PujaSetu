package com.pujasetu.config;

import com.pujasetu.model.enums.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.Arrays;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(Arrays.asList(
                new UserRoleWriteConverter(),
                new UserRoleReadConverter(),
                new BookingStatusWriteConverter(),
                new BookingStatusReadConverter(),
                new VerificationStatusWriteConverter(),
                new VerificationStatusReadConverter(),
                new ProviderTypeWriteConverter(),
                new ProviderTypeReadConverter(),
                new BookingTypeWriteConverter(),
                new BookingTypeReadConverter(),
                new NotificationTypeWriteConverter(),
                new NotificationTypeReadConverter()
        ));
    }

    @WritingConverter
    static class UserRoleWriteConverter implements Converter<UserRole, String> {
        @Override
        public String convert(UserRole source) {
            return source.getValue();
        }
    }

    @ReadingConverter
    static class UserRoleReadConverter implements Converter<String, UserRole> {
        @Override
        public UserRole convert(String source) {
            return UserRole.fromValue(source);
        }
    }

    @WritingConverter
    static class BookingStatusWriteConverter implements Converter<BookingStatus, String> {
        @Override
        public String convert(BookingStatus source) {
            return source.getValue();
        }
    }

    @ReadingConverter
    static class BookingStatusReadConverter implements Converter<String, BookingStatus> {
        @Override
        public BookingStatus convert(String source) {
            return BookingStatus.fromValue(source);
        }
    }

    @WritingConverter
    static class VerificationStatusWriteConverter implements Converter<VerificationStatus, String> {
        @Override
        public String convert(VerificationStatus source) {
            return source.getValue();
        }
    }

    @ReadingConverter
    static class VerificationStatusReadConverter implements Converter<String, VerificationStatus> {
        @Override
        public VerificationStatus convert(String source) {
            return VerificationStatus.fromValue(source);
        }
    }

    @WritingConverter
    static class ProviderTypeWriteConverter implements Converter<ProviderType, String> {
        @Override
        public String convert(ProviderType source) {
            return source.getValue();
        }
    }

    @ReadingConverter
    static class ProviderTypeReadConverter implements Converter<String, ProviderType> {
        @Override
        public ProviderType convert(String source) {
            return ProviderType.fromValue(source);
        }
    }

    @WritingConverter
    static class BookingTypeWriteConverter implements Converter<BookingType, String> {
        @Override
        public String convert(BookingType source) {
            return source.getValue();
        }
    }

    @ReadingConverter
    static class BookingTypeReadConverter implements Converter<String, BookingType> {
        @Override
        public BookingType convert(String source) {
            return BookingType.fromValue(source);
        }
    }

    @WritingConverter
    static class NotificationTypeWriteConverter implements Converter<NotificationType, String> {
        @Override
        public String convert(NotificationType source) {
            return source.getValue();
        }
    }

    @ReadingConverter
    static class NotificationTypeReadConverter implements Converter<String, NotificationType> {
        @Override
        public NotificationType convert(String source) {
            for (NotificationType type : NotificationType.values()) {
                if (type.getValue().equalsIgnoreCase(source)) {
                    return type;
                }
            }
            return NotificationType.GENERAL;
        }
    }
}
