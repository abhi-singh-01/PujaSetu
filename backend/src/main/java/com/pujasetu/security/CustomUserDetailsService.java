package com.pujasetu.security;

import com.pujasetu.exception.UnauthorizedException;
import com.pujasetu.model.User;
import com.pujasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByMobile(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (!user.isActive()) {
            throw new UnauthorizedException("User not found or inactive");
        }
        return new UserPrincipal(user);
    }

    public UserDetails loadUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("User not found or inactive"));
        if (!user.isActive()) {
            throw new UnauthorizedException("User not found or inactive");
        }
        return new UserPrincipal(user);
    }
}
