package com.scorebtw.api.repository;

import com.scorebtw.api.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUserId(Long userId);

    List<Review> findByGameId(Long gameId);

    Optional<Review> findByUserIdAndGameId(Long userId, Long gameId);
}
