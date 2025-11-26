package com.scorebtw.api.controller;

import com.scorebtw.api.payload.ProfileDTO;
import com.scorebtw.api.payload.UserDTO;
import com.scorebtw.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Ottieni informazioni utente corrente //
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        UserDTO user = userService.getCurrentUserInfo();
        return ResponseEntity.ok(user);
    }

    // Ottieni profilo di un utente //
    @GetMapping("/{userId}/profile")
    public ResponseEntity<ProfileDTO.ProfileResponse> getUserProfile(@PathVariable Long userId) {
        ProfileDTO.ProfileResponse profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }

    // Aggiorna il proprio profilo //
    @PutMapping("/me/profile")
    public ResponseEntity<ProfileDTO.ProfileResponse> updateProfile(
            @Valid @RequestBody ProfileDTO.UpdateProfileRequest request
    ) {
        ProfileDTO.ProfileResponse profile = userService.updateProfile(request);
        return ResponseEntity.ok(profile);
    }

    // Upload avatar //
    @PostMapping("/me/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "File is required"));
        }
        
        String avatarUrl = userService.uploadAvatar(file);
        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    // Cerca utenti per username //
    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(
            @RequestParam String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize
    ) {
        List<UserDTO> users = userService.searchUsers(q, page, pageSize);
        return ResponseEntity.ok(users);
    }
}