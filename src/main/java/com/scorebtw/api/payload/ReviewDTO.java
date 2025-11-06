package com.scorebtw.api.payload;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReviewDTO {

    public record ReviewRequest(
            @NotNull(message = "Game ID is required")
            Long gameId,

            @NotNull(message = "Rating is required")
            @DecimalMin(value = "0.0", message = "Rating must be at least 0.0")
            @DecimalMax(value = "10.0", message = "Rating must be at most 10.0")
            BigDecimal rating,

            @Size(max = 200, message = "Title must be less than 200 characters")
            String title,

            @Size(max = 5000, message = "Content must be less than 5000 characters")
            String content
    ) {
    }

    public record ReviewResponse(
            Long id,
            UserSimpleDTO user,
            GameSimpleDTO game,
            BigDecimal rating,
            String title,
            String content,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }

    public record UserSimpleDTO(
            Long id,
            String username,
            String avatarUrl
    ) {
    }

    public record GameSimpleDTO(
            Long id,
            String title,
            String coverImageUrl,
            Double averageRating
    ) {
    }
}