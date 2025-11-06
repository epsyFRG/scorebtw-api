package com.scorebtw.api.repository;

import com.scorebtw.api.entity.Follow;
import com.scorebtw.api.entity.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, FollowId> {
    List<Follow> findByFollowerId(Long followerId);

    List<Follow> findByFollowingId(Long followingId);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
