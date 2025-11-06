package com.scorebtw.api.payload;

import jakarta.validation.constraints.Size;

public class ProfileDTO {

    public record ProfileResponse(
            Long id,
            String bio,
            String avatarUrl,
            Boolean isPrivate,
            GameSimpleDTO favoriteGame,
            Integer followersCount,
            Integer followingCount,
            Integer reviewsCount
    ) {
    }

    public record UpdateProfileRequest(
            @Size(max = 500, message = "Bio must be less than 500 characters")
            String bio,

            String avatarUrl,
            Boolean isPrivate,
            Long favoriteGameId
    ) {
    }

    public record GameSimpleDTO(
            Long id,
            String title,
            String coverImageUrl
    ) {
    }
}
