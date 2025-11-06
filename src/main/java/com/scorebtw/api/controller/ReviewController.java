package com.scorebtw.api.controller;

import com.scorebtw.api.payload.ReviewDTO;
import com.scorebtw.api.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDTO.ReviewResponse> createReview(
            @Valid @RequestBody ReviewDTO.ReviewRequest request
    ) {
        ReviewDTO.ReviewResponse response = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewDTO.ReviewResponse> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDTO.ReviewRequest request
    ) {
        ReviewDTO.ReviewResponse response = reviewService.updateReview(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO.ReviewResponse> getReview(@PathVariable Long id) {
        ReviewDTO.ReviewResponse response = reviewService.getReview(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<ReviewDTO.ReviewResponse>> getReviewsByGame(@PathVariable Long gameId) {
        List<ReviewDTO.ReviewResponse> reviews = reviewService.getReviewsByGame(gameId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewDTO.ReviewResponse>> getReviewsByUser(@PathVariable Long userId) {
        List<ReviewDTO.ReviewResponse> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> hasUserReviewedGame(
            @RequestParam Long userId,
            @RequestParam Long gameId
    ) {
        boolean hasReviewed = reviewService.hasUserReviewedGame(userId, gameId);
        return ResponseEntity.ok(hasReviewed);
    }
}