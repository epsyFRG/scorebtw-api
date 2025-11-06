package com.scorebtw.api.payload;

import java.util.Set;

public record UserDTO(
        Long id,
        String username,
        String email,
        Set<String> roles,
        ProfileDTO profile
) {
}


