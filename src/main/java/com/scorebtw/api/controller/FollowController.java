package com.scorebtw.api.controller;

import com.scorebtw.api.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // Segui un utente //
    @PostMapping("/{userId}/follow")
    public ResponseEntity<Void> followUser(@PathVariable Long userId) {
        followService.followUser(userId);
        return ResponseEntity.ok().build();
    }

    // Smetti di seguire un utente //
    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long userId) {
        followService.unfollowUser(userId);
        return ResponseEntity.noContent().build();
    }

    // Ottieni i follower di un utente //
    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<FollowService.UserSimpleDTO>> getFollowers(@PathVariable Long userId) {
        List<FollowService.UserSimpleDTO> followers = followService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    // Ottieni gli utenti seguiti da un utente //
    @GetMapping("/{userId}/following")
    public ResponseEntity<List<FollowService.UserSimpleDTO>> getFollowing(@PathVariable Long userId) {
        List<FollowService.UserSimpleDTO> following = followService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }

    // Verifica se un utente segue un altro //
    @GetMapping("/check-follow")
    public ResponseEntity<Boolean> isFollowing(
            @RequestParam Long followerId,
            @RequestParam Long followingId
    ) {
        boolean isFollowing = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(isFollowing);
    }
}