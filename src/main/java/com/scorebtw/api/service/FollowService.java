package com.scorebtw.api.service;

import com.scorebtw.api.entity.Follow;
import com.scorebtw.api.entity.User;
import com.scorebtw.api.exception.BadRequestException;
import com.scorebtw.api.exception.ResourceNotFoundException;
import com.scorebtw.api.exception.UnauthorizedException;
import com.scorebtw.api.repository.FollowRepository;
import com.scorebtw.api.repository.UserRepository;
import com.scorebtw.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Transactional
    public void followUser(Long userIdToFollow) {
        User currentUser = getCurrentUser();

        if (currentUser.getId().equals(userIdToFollow)) {
            throw new BadRequestException("You cannot follow yourself");
        }

        User userToFollow = userRepository.findById(userIdToFollow)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), userIdToFollow)) {
            throw new BadRequestException("You are already following this user");
        }

        Follow follow = new Follow();
        follow.setFollower(currentUser);
        follow.setFollowing(userToFollow);

        followRepository.save(follow);
        log.info("User {} followed user {}", currentUser.getId(), userIdToFollow);
    }

    @Transactional
    public void unfollowUser(Long userIdToUnfollow) {
        User currentUser = getCurrentUser();

        Follow follow = followRepository.findByFollowerIdAndFollowingId(
                        currentUser.getId(), userIdToUnfollow)
                .orElseThrow(() -> new ResourceNotFoundException("Follow relationship not found"));

        followRepository.delete(follow);
        log.info("User {} unfollowed user {}", currentUser.getId(), userIdToUnfollow);
    }

    public List<UserSimpleDTO> getFollowers(Long userId) {
        List<Follow> follows = followRepository.findByFollowingId(userId);
        return follows.stream()
                .map(follow -> new UserSimpleDTO(
                        follow.getFollower().getId(),
                        follow.getFollower().getUsername(),
                        follow.getFollower().getProfile() != null ?
                                follow.getFollower().getProfile().getAvatarUrl() : null
                ))
                .collect(Collectors.toList());
    }

    public List<UserSimpleDTO> getFollowing(Long userId) {
        List<Follow> follows = followRepository.findByFollowerId(userId);
        return follows.stream()
                .map(follow -> new UserSimpleDTO(
                        follow.getFollowing().getId(),
                        follow.getFollowing().getUsername(),
                        follow.getFollowing().getProfile() != null ?
                                follow.getFollowing().getProfile().getAvatarUrl() : null
                ))
                .collect(Collectors.toList());
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }

    public record UserSimpleDTO(
            Long id,
            String username,
            String avatarUrl
    ) {
    }
}
