package com.scorebtw.api.repository;

import com.scorebtw.api.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUserId(Long userId);

    List<Review> findByGameId(Long gameId);

    Optional<Review> findByUserIdAndGameId(Long userId, Long gameId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "INSERT INTO reviews (user_id, game_id, rating, title, content, created_at, updated_at) " +
                   "VALUES (:userId, :gameId, :rating, :title, :content, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", 
                   nativeQuery = true)
    void insertReviewNative(@Param("userId") Long userId, 
                            @Param("gameId") Long gameId, 
                            @Param("rating") BigDecimal rating, 
                            @Param("title") String title, 
                            @Param("content") String content);
}
