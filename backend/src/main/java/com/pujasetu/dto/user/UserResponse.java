package com.pujasetu.dto.user;

import com.pujasetu.model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private String id;
    private String mobile;
    private String name;
    private String role;
    private String profilePhoto;
    private User.UserLocation location;
    private Boolean isVerified;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .mobile(user.getMobile())
                .name(user.getName())
                .role(user.getRole().getValue())
                .profilePhoto(user.getProfilePhoto())
                .location(user.getLocation())
                .isVerified(user.isVerified())
                .build();
    }
}
