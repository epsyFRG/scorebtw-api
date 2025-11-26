package com.scorebtw.api.service;

import com.scorebtw.api.entity.Game;
import com.scorebtw.api.entity.Review;
import com.scorebtw.api.entity.User;
import com.scorebtw.api.exception.BadRequestException;
import com.scorebtw.api.exception.ResourceNotFoundException;
import com.scorebtw.api.exception.UnauthorizedException;
import com.scorebtw.api.payload.RawgDTO;
import com.scorebtw.api.payload.ReviewDTO;
import com.scorebtw.api.repository.ReviewRepository;
import com.scorebtw.api.security.CustomUserDetails;
import jakarta.persistence.EntityManager;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.Year;
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
    private final GameService gameService;
    private final RawgService rawgService;
    private final EntityManager entityManager;
    private final DataSource dataSource;

    // Public method WITHOUT @Transactional - ensures Game import happens BEFORE transaction
    public ReviewDTO.ReviewResponse createReview(ReviewDTO.ReviewRequest request) {
        log.info("ReviewService - Starting createReview for gameId: {} (NO TRANSACTION YET)", request.gameId());
        
        User currentUser = getCurrentUser();
        log.info("ReviewService - Current user: {} (ID: {})", currentUser.getUsername(), currentUser.getId());

        // Check for duplicate review OUTSIDE of transaction
        if (reviewRepository.findByUserIdAndGameId(currentUser.getId(), request.gameId()).isPresent()) {
            log.warn("ReviewService - User {} already reviewed game {}", currentUser.getId(), request.gameId());
            throw new BadRequestException("You have already reviewed this game");
        }

        log.info("ReviewService - Checking if game exists using JDBC (no Hibernate)...");
        
        // Check if game exists using JDBC only - no Hibernate involvement
        boolean gameExists = false;
        try (Connection conn = dataSource.getConnection()) {
            try (PreparedStatement stmt = conn.prepareStatement(
                "SELECT EXISTS(SELECT 1 FROM games WHERE id = ?)"
            )) {
                stmt.setLong(1, request.gameId());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        gameExists = rs.getBoolean(1);
                    }
                }
            }
        } catch (java.sql.SQLException e) {
            log.error("ReviewService - SQL error checking game existence: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to check game existence", e);
        }
        
        if (!gameExists) {
            log.info("ReviewService - Game {} does not exist. Importing using JDBC (no Hibernate)...", request.gameId());
            // Import game using JDBC only - this prevents Hibernate from tracking it
            importGameUsingJdbc(request.gameId());
            log.info("ReviewService - Game imported successfully using JDBC. Proceeding with review insertion...");
        } else {
            log.info("ReviewService - Game exists. Proceeding with review insertion using JDBC only...");
        }
        
        // Do NOT use Hibernate for anything - use JDBC only to avoid tracking
        
        // Now start the transaction for review insertion
        return createReviewInTransaction(request, currentUser);
    }
    
    // NO @Transactional annotation - use JDBC transaction directly
    // This prevents Hibernate from interfering with the transaction
    private ReviewDTO.ReviewResponse createReviewInTransaction(ReviewDTO.ReviewRequest request, User currentUser) {
        log.info("ReviewService - Starting review insertion transaction for game ID: {} and user ID: {}", 
                request.gameId(), currentUser.getId());
        
        try {

            // Insert review using JDBC DIRECTLY, completely bypassing Hibernate
            // This ensures NO Hibernate entity tracking or relationship synchronization
            Long reviewId;
            java.time.LocalDateTime createdAt;
            java.time.LocalDateTime updatedAt;
            
            try (Connection conn = dataSource.getConnection()) {
                try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO reviews (user_id, game_id, rating, title, content, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
                    "RETURNING id, created_at, updated_at"
                )) {
                    stmt.setLong(1, currentUser.getId());
                    stmt.setLong(2, request.gameId());
                    stmt.setBigDecimal(3, request.rating());
                    stmt.setString(4, request.title());
                    stmt.setString(5, request.content());
                    
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            reviewId = rs.getLong("id");
                            createdAt = rs.getTimestamp("created_at").toLocalDateTime();
                            updatedAt = rs.getTimestamp("updated_at").toLocalDateTime();
                        } else {
                            throw new ResourceNotFoundException("Failed to insert review");
                        }
                    }
                }
            } catch (java.sql.SQLException e) {
                // Check if it's a foreign key constraint violation (game doesn't exist)
                if (e.getSQLState() != null && e.getSQLState().startsWith("23")) {
                    // Foreign key constraint violation - game doesn't exist
                    log.warn("ReviewService - Game {} does not exist, importing...", request.gameId());
                    // Import game using Hibernate in separate transaction
                    gameService.ensureGameExists(request.gameId());
                    // CRITICAL: Clear persistence context IMMEDIATELY after game import
                    // This prevents Hibernate from tracking the Game entity
                    try {
                        entityManager.flush();
                        entityManager.clear();
                        log.info("ReviewService - Persistence context cleared after game import");
                    } catch (Exception clearEx) {
                        log.warn("ReviewService - Could not clear persistence context: {}", clearEx.getMessage());
                    }
                    // Wait for import and clear to complete
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                    // Try inserting review again using JDBC
                    try (Connection conn2 = dataSource.getConnection()) {
                        try (PreparedStatement stmt2 = conn2.prepareStatement(
                            "INSERT INTO reviews (user_id, game_id, rating, title, content, created_at, updated_at) " +
                            "VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
                            "RETURNING id, created_at, updated_at"
                        )) {
                            stmt2.setLong(1, currentUser.getId());
                            stmt2.setLong(2, request.gameId());
                            stmt2.setBigDecimal(3, request.rating());
                            stmt2.setString(4, request.title());
                            stmt2.setString(5, request.content());
                            
                            try (ResultSet rs2 = stmt2.executeQuery()) {
                                if (rs2.next()) {
                                    reviewId = rs2.getLong("id");
                                    createdAt = rs2.getTimestamp("created_at").toLocalDateTime();
                                    updatedAt = rs2.getTimestamp("updated_at").toLocalDateTime();
                                    log.info("ReviewService - Review inserted successfully after game import");
                                } else {
                                    throw new ResourceNotFoundException("Failed to insert review");
                                }
                            }
                        }
                    } catch (java.sql.SQLException e2) {
                        log.error("ReviewService - SQL error inserting review after game import: {}", e2.getMessage(), e2);
                        throw new RuntimeException("Failed to insert review after game import", e2);
                    }
                } else {
                    log.error("ReviewService - SQL error inserting review: {}", e.getMessage(), e);
                    throw new RuntimeException("Failed to insert review", e);
                }
            }
            
            // NO entityManager operations - we're using JDBC directly, no Hibernate involved
            
            // Build response manually using JDBC ONLY - completely bypass Hibernate/EntityManager
            // This ensures NO Game entity is ever loaded or tracked by Hibernate
            ReviewDTO.UserSimpleDTO userDTO = new ReviewDTO.UserSimpleDTO(
                    currentUser.getId(),
                    currentUser.getUsername(),
                    currentUser.getProfile() != null ? currentUser.getProfile().getAvatarUrl() : null
            );

            // Get Game data using JDBC DIRECTLY - no Hibernate involvement at all
            Long gameIdFromDb;
            String gameTitle;
            String gameCoverUrl;
            Double avgRating;
            
            try (Connection conn = dataSource.getConnection()) {
                // Get game data
                try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT id, title, cover_image_url FROM games WHERE id = ?"
                )) {
                    stmt.setLong(1, request.gameId());
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            gameIdFromDb = rs.getLong("id");
                            gameTitle = rs.getString("title");
                            gameCoverUrl = rs.getString("cover_image_url");
                        } else {
                            throw new ResourceNotFoundException("Game not found");
                        }
                    }
                }
                
                // Calculate average rating using JDBC
                try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT COALESCE(AVG(rating), 0.0) FROM reviews WHERE game_id = ?"
                )) {
                    stmt.setLong(1, request.gameId());
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            avgRating = rs.getDouble(1);
                        } else {
                            avgRating = 0.0;
                        }
                    }
                }
            } catch (java.sql.SQLException e) {
                log.error("ReviewService - SQL error retrieving game data: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to retrieve game data", e);
            }
            
            ReviewDTO.GameSimpleDTO gameDTO = new ReviewDTO.GameSimpleDTO(
                    gameIdFromDb,
                    gameTitle,
                    gameCoverUrl,
                    avgRating
            );

            ReviewDTO.ReviewResponse response = new ReviewDTO.ReviewResponse(
                    reviewId,
                    userDTO,
                    gameDTO,
                    request.rating(),
                    request.title(),
                    request.content(),
                    createdAt,
                    updatedAt
            );
            
            log.info("ReviewService - Review created successfully: reviewId={}, userId={}, gameId={}, rating={}",
                    reviewId, currentUser.getId(), request.gameId(), request.rating());

            return response;
        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            log.error("ReviewService - Optimistic locking failure for Game entity: {}", e.getMessage(), e);
            log.error("ReviewService - This suggests Hibernate is trying to update Game when inserting Review");
            log.error("ReviewService - Game ID: {}, Review details: userId={}, gameId={}, rating={}", 
                    request.gameId(), currentUser.getId(), request.gameId(), request.rating());
            throw new RuntimeException("Failed to save review: optimistic locking conflict with Game entity. " +
                    "This should not happen when using JDBC. Check if Game entity is being tracked by Hibernate.", e);
        } catch (UnauthorizedException e) {
            log.error("ReviewService - Unauthorized: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("ReviewService - Unexpected error: {}", e.getMessage(), e);
            log.error("ReviewService - Error type: {}, Game ID: {}", e.getClass().getName(), request.gameId());
            e.printStackTrace();
            throw e;
        }
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
        log.info("ReviewService - getCurrentUser - Authentication: {}", authentication != null ? authentication.getName() : "null");
        log.info("ReviewService - getCurrentUser - Is authenticated: {}", authentication != null && authentication.isAuthenticated());
        
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("ReviewService - getCurrentUser - User not authenticated");
            throw new UnauthorizedException("User not authenticated");
        }
        
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            log.info("ReviewService - getCurrentUser - User details found: {}", userDetails.getUsername());
            return userDetails.getUser();
        } catch (ClassCastException e) {
            log.error("ReviewService - getCurrentUser - Principal is not CustomUserDetails: {}", authentication.getPrincipal().getClass().getName());
            throw new UnauthorizedException("Invalid authentication principal");
        }
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
                Game.calculateAverageRating(reviewRepository.findByGameId(review.getGame().getId()))
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
    
    /**
     * Import game using JDBC ONLY - completely bypasses Hibernate
     * This prevents Hibernate from tracking the Game entity and causing transaction conflicts
     */
    private void importGameUsingJdbc(Long gameId) {
        log.info("ReviewService - Importing game {} using JDBC (no Hibernate)...", gameId);
        
        try {
            // Get game details from RAWG API
            RawgDTO.GameDetail rawgGame = rawgService.getGameDetails(gameId);
            
            // Insert game using JDBC
            try (Connection conn = dataSource.getConnection()) {
                conn.setAutoCommit(false);
                try {
                    // Insert game - use INSERT with ON CONFLICT DO NOTHING to avoid duplicate key errors
                    try (PreparedStatement stmt = conn.prepareStatement(
                        "INSERT INTO games (id, title, description, release_year, developer, publisher, cover_image_url, created_at, updated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
                        "ON CONFLICT (id) DO NOTHING"
                    )) {
                        stmt.setLong(1, rawgGame.getId());
                        stmt.setString(2, rawgGame.getName());
                        String description = rawgGame.getDescriptionRaw() != null ? 
                                rawgGame.getDescriptionRaw() : rawgGame.getDescription();
                        stmt.setString(3, description);
                        
                        if (rawgGame.getReleased() != null && !rawgGame.getReleased().isEmpty()) {
                            try {
                                stmt.setInt(4, Year.parse(rawgGame.getReleased().substring(0, 4)).getValue());
                            } catch (Exception e) {
                                stmt.setObject(4, null);
                            }
                        } else {
                            stmt.setObject(4, null);
                        }
                        
                        if (rawgGame.getDevelopers() != null && !rawgGame.getDevelopers().isEmpty()) {
                            stmt.setString(5, rawgGame.getDevelopers().get(0).getName());
                        } else {
                            stmt.setObject(5, null);
                        }
                        
                        if (rawgGame.getPublishers() != null && !rawgGame.getPublishers().isEmpty()) {
                            stmt.setString(6, rawgGame.getPublishers().get(0).getName());
                        } else {
                            stmt.setObject(6, null);
                        }
                        
                        stmt.setString(7, rawgGame.getBackgroundImage());
                        
                        stmt.executeUpdate();
                    }
                    
                    // Handle genres - insert into game_genres table using JDBC
                    if (rawgGame.getGenres() != null) {
                        for (RawgDTO.GenreInfo genreInfo : rawgGame.getGenres()) {
                            // First, ensure genre exists
                            Long genreId = getOrCreateGenreId(conn, genreInfo.getName());
                            // Then, insert into game_genres join table
                            try (PreparedStatement stmt = conn.prepareStatement(
                                "INSERT INTO game_genres (game_id, genre_id) VALUES (?, ?) ON CONFLICT DO NOTHING"
                            )) {
                                stmt.setLong(1, rawgGame.getId());
                                stmt.setLong(2, genreId);
                                stmt.executeUpdate();
                            }
                        }
                    }
                    
                    // Handle platforms - insert into game_platforms table using JDBC
                    if (rawgGame.getPlatforms() != null) {
                        for (RawgDTO.PlatformInfo platformInfo : rawgGame.getPlatforms()) {
                            // First, ensure platform exists
                            Long platformId = getOrCreatePlatformId(conn, platformInfo.getPlatform().getName());
                            // Then, insert into game_platforms join table
                            try (PreparedStatement stmt = conn.prepareStatement(
                                "INSERT INTO game_platforms (game_id, platform_id) VALUES (?, ?) ON CONFLICT DO NOTHING"
                            )) {
                                stmt.setLong(1, rawgGame.getId());
                                stmt.setLong(2, platformId);
                                stmt.executeUpdate();
                            }
                        }
                    }
                    
                    conn.commit();
                    log.info("ReviewService - Game {} imported successfully using JDBC", gameId);
                } catch (Exception e) {
                    conn.rollback();
                    throw e;
                } finally {
                    conn.setAutoCommit(true);
                }
            }
        } catch (Exception e) {
            log.error("ReviewService - Error importing game using JDBC: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to import game: " + gameId, e);
        }
    }
    
    private Long getOrCreateGenreId(Connection conn, String genreName) throws java.sql.SQLException {
        // Check if genre exists
        try (PreparedStatement stmt = conn.prepareStatement("SELECT id FROM genres WHERE name = ?")) {
            stmt.setString(1, genreName);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("id");
                }
            }
        }
        
        // Genre doesn't exist, create it
        try (PreparedStatement stmt = conn.prepareStatement(
            "INSERT INTO genres (name) VALUES (?) RETURNING id"
        )) {
            stmt.setString(1, genreName);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("id");
                }
            }
        }
        throw new RuntimeException("Failed to create genre: " + genreName);
    }
    
    private Long getOrCreatePlatformId(Connection conn, String platformName) throws java.sql.SQLException {
        // Check if platform exists
        try (PreparedStatement stmt = conn.prepareStatement("SELECT id FROM platforms WHERE name = ?")) {
            stmt.setString(1, platformName);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("id");
                }
            }
        }
        
        // Platform doesn't exist, create it
        try (PreparedStatement stmt = conn.prepareStatement(
            "INSERT INTO platforms (name) VALUES (?) RETURNING id"
        )) {
            stmt.setString(1, platformName);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("id");
                }
            }
        }
        throw new RuntimeException("Failed to create platform: " + platformName);
    }
}