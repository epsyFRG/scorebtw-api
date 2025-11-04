package com.scorebtw.api.service;

import com.scorebtw.api.entity.Profile;
import com.scorebtw.api.entity.User;
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
        // Validazione: username già esistente
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }

        // Validazione: email già esistente
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        // Crea nuovo utente
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        // Assegna ruolo USER di default
        Set<String> roles = new HashSet<>();
        roles.add("USER");
        user.setRoles(roles);

        // Salva utente
        User savedUser = userRepository.save(user);

        // Crea profilo associato all'utente
        Profile profile = new Profile();
        profile.setUser(savedUser);
        profile.setIsPrivate(false);
        profileRepository.save(profile);

        // Genera JWT token
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtUtil.generateToken(userDetails);

        // Prepara response
        UserDTO userDTO = new UserDTO(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRoles()
        );

        return new AuthDTO.AuthResponse(token, userDTO);
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        // Autentica utente
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        // Ottieni user details
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        // Genera JWT token
        String token = jwtUtil.generateToken(userDetails);

        // Prepara response
        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles()
        );

        return new AuthDTO.AuthResponse(token, userDTO);
    }
}