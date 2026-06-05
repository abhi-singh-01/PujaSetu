package com.pujasetu.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    public UserPrincipal requireCurrentUser() {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            throw new com.pujasetu.exception.UnauthorizedException("Not authorized");
        }
        return principal;
    }
}
