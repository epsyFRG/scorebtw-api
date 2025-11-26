package com.scorebtw.api.service;

import com.scorebtw.api.entity.Game;
import com.scorebtw.api.entity.Profile;
import com.scorebtw.api.entity.User;
import com.scorebtw.api.exception.ResourceNotFoundException;
import com.scorebtw.api.exception.UnauthorizedException;
import com.scorebtw.api.payload.ProfileDTO;
import com.scorebtw.api.payload.UserDTO;
import com.scorebtw.api.repository.GameRepository;
import com.scorebtw.api.repository.ProfileRepository;
import com.scorebtw.api.repository.ReviewRepository;
import com.scorebtw.api.repository.UserRepository;
import com.scorebtw.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ReviewRepository reviewRepository;
    private final GameRepository gameRepository;
    private final CloudinaryService cloudinaryService;

    public UserDTO getCurrentUserInfo() {
        User user = getCurrentUser();
        return mapToUserDTO(user);
    }

    public ProfileDTO.ProfileResponse getUserProfile(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return mapToProfileResponse(profile);
    }

    @Transactional
    public ProfileDTO.ProfileResponse updateProfile(ProfileDTO.UpdateProfileRequest request) {
        User currentUser = getCurrentUser();

        Profile profile = profileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (request.bio() != null) {
            profile.setBio(request.bio());
        }

        if (request.avatarUrl() != null) {
            profile.setAvatarUrl(request.avatarUrl());
        }

        if (request.isPrivate() != null) {
            profile.setIsPrivate(request.isPrivate());
        }

        if (request.favoriteGameId() != null) {
            Game favoriteGame = gameRepository.findById(request.favoriteGameId())
                    .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
            profile.setFavoriteGame(favoriteGame);
        }

        Profile updatedProfile = profileRepository.save(profile);
        log.info("Profile updated: userId={}", currentUser.getId());

        return mapToProfileResponse(updatedProfile);
    }

    public List<UserDTO> searchUsers(String query, Integer page, Integer pageSize) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        int pageNumber = page != null && page > 0 ? page - 1 : 0;
        int size = pageSize != null && pageSize > 0 ? pageSize : 20;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Page<User> usersPage = userRepository.findByUsernameContainingIgnoreCase(query.trim(), pageable);
        
        return usersPage.getContent().stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public String uploadAvatar(MultipartFile file) throws IOException {
        User currentUser = getCurrentUser();

        Profile profile = profileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        // Elimina vecchio avatar se esiste
        if (profile.getAvatarUrl() != null) {
            String publicId = cloudinaryService.extractPublicId(profile.getAvatarUrl());
            if (publicId != null) {
                try {
                    cloudinaryService.deleteImage(publicId);
                } catch (Exception e) {
                    log.warn("Failed to delete old avatar: {}", e.getMessage());
                }
            }
        }

        // Upload nuovo avatar
        String avatarUrl = cloudinaryService.uploadAvatar(file);
        profile.setAvatarUrl(avatarUrl);
        profileRepository.save(profile);

        log.info("Avatar uploaded: userId={}, url={}", currentUser.getId(), avatarUrl);
        return avatarUrl;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }

    private UserDTO mapToUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles(),
                null
        );
    }

    private ProfileDTO.ProfileResponse mapToProfileResponse(Profile profile) {
        ProfileDTO.GameSimpleDTO favoriteGameDTO = null;
        if (profile.getFavoriteGame() != null) {
            Game game = profile.getFavoriteGame();
            favoriteGameDTO = new ProfileDTO.GameSimpleDTO(
                    game.getId(),
                    game.getTitle(),
                    game.getCoverImageUrl()
            );
        }

        int followersCount = profile.getUser().getFollowers() != null ?
                profile.getUser().getFollowers().size() : 0;
        int followingCount = profile.getUser().getFollowing() != null ?
                profile.getUser().getFollowing().size() : 0;
        int reviewsCount = reviewRepository.findByUserId(profile.getUser().getId()).size();

        return new ProfileDTO.ProfileResponse(
                profile.getId(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getIsPrivate(),
                favoriteGameDTO,
                followersCount,
                followingCount,
                reviewsCount,
                profile.getUser().getUsername()
        );
    }
}