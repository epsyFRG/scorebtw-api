package com.scorebtw.api.repository;

import com.scorebtw.api.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByTitleContainingIgnoreCase(String title);

    List<Game> findByReleaseYear(Integer year);
}
