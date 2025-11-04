package com.scorebtw.api.repository;

import com.scorebtw.api.entity.Platform;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlatformRepository extends JpaRepository<Platform, Long> {
    Optional<Platform> findByNameIgnoreCase(String name);
}