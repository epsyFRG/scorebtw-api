package com.scorebtw.api.service;

import com.scorebtw.api.entity.Game;
import com.scorebtw.api.entity.Review;
import com.scorebtw.api.entity.User;
import com.scorebtw.api.exception.BadRequestException;
import com.scorebtw.api.exception.ResourceNotFoundException;
import com.scorebtw.api.exception.UnauthorizedException;
import com.scorebtw.api.payload.ReviewDTO;
import com.scorebtw.api.repository.ReviewRepository;
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
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final GameService gameService;

    @Transactional
    public ReviewDTO.ReviewResponse createReview(ReviewDTO.ReviewRequest request) {
        User currentUser = getCurrentUser();

        if (reviewRepository.findByUserIdAndGameId(currentUser.getId(), request.gameId()).isPresent()) {
            throw new BadRequestException("You have already reviewed this game");
        }

        Game game = gameService.getOrImportGame(request.gameId());

        Review review = new Review();
        review.setUser(currentUser);
        review.setGame(game);
        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setContent(request.content());

        Review savedReview = reviewRepository.save(review);
        log.info("Review created: userId={}, gameId={}, rating={}",
                currentUser.getId(), game.getId(), request.rating());

        return mapToReviewResponse(savedReview);
    }

    @Transactional
    public ReviewDTO.ReviewResponse updateReview(Long reviewId, ReviewDTO.ReviewRequest request) {
        User currentUser = getCurrentUser();

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only update your own reviews");
        }

        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setContent(request.content());

        Review updatedReview = reviewRepository.save(review);
        log.info("Review updated: reviewId={}, userId={}", reviewId, currentUser.getId());

        return mapToReviewResponse(updatedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        User currentUser = getCurrentUser();

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
        log.info("Review deleted: reviewId={}, userId={}", reviewId, currentUser.getId());
    }

    public List<ReviewDTO.ReviewResponse> getReviewsByGame(Long gameId) {
        List<Review> reviews = reviewRepository.findByGameId(gameId);
        return reviews.stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO.ReviewResponse> getReviewsByUser(Long userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    public ReviewDTO.ReviewResponse getReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return mapToReviewResponse(review);
    }

    public ReviewDTO.ReviewResponse getUserReviewForGame(Long userId, Long gameId) {
        Review review = reviewRepository.findByUserIdAndGameId(userId, gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return mapToReviewResponse(review);
    }

    public boolean hasUserReviewedGame(Long userId, Long gameId) {
        return reviewRepository.findByUserIdAndGameId(userId, gameId).isPresent();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }

    private ReviewDTO.ReviewResponse mapToReviewResponse(Review review) {
        ReviewDTO.UserSimpleDTO userDTO = new ReviewDTO.UserSimpleDTO(
                review.getUser().getId(),
                review.getUser().getUsername(),
                review.getUser().getProfile() != null ? review.getUser().getProfile().getAvatarUrl() : null
        );

        ReviewDTO.GameSimpleDTO gameDTO = new ReviewDTO.GameSimpleDTO(
                review.getGame().getId(),
                review.getGame().getTitle(),
                review.getGame().getCoverImageUrl(),
                review.getGame().getAverageRating()
        );

        return new ReviewDTO.ReviewResponse(
                review.getId(),
                userDTO,
                gameDTO,
                review.getRating(),
                review.getTitle(),
                review.getContent(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}