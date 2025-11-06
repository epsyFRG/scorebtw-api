package com.scorebtw.api.service;

import com.scorebtw.api.entity.Profile;
import com.scorebtw.api.entity.User;
import com.scorebtw.api.exception.BadRequestException;
import com.scorebtw.api.payload.AuthDTO;
import com.scorebtw.api.payload.UserDTO;
import com.scorebtw.api.repository.ProfileRepository;
import com.scorebtw.api.repository.UserRepository;
import com.scorebtw.api.security.CustomUserDetails;
import com.scorebtw.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        Set<String> roles = new HashSet<>();
        roles.add("USER");
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        Profile profile = new Profile();
        profile.setUser(savedUser);
        profile.setIsPrivate(false);
        profileRepository.save(profile);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtUtil.generateToken(userDetails);

        UserDTO userDTO = new UserDTO(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRoles(),
                null
        );

        return new AuthDTO.AuthResponse(token, userDTO);
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        String token = jwtUtil.generateToken(userDetails);

        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles(),
                null
        );

        return new AuthDTO.AuthResponse(token, userDTO);
    }
}