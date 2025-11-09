package com.scorebtw.api.service;

import com.scorebtw.api.entity.Game;
import com.scorebtw.api.entity.Genre;
import com.scorebtw.api.entity.Platform;
import com.scorebtw.api.payload.RawgDTO;
import com.scorebtw.api.repository.GameRepository;
import com.scorebtw.api.repository.GenreRepository;
import com.scorebtw.api.repository.PlatformRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository gameRepository;
    private final GenreRepository genreRepository;
    private final PlatformRepository platformRepository;
    private final RawgService rawgService;

    public RawgDTO.GameSearchResponse searchGamesFromRawg(String query, Integer page, Integer pageSize) {
        return rawgService.searchGames(query, page, pageSize);
    }

    @Transactional
    public Game getOrImportGame(Long rawgGameId) {
        Optional<Game> existingGame = gameRepository.findById(rawgGameId);

        if (existingGame.isPresent()) {
            log.info("Game already exists in local DB: {}", rawgGameId);
            return existingGame.get();
        }

        log.info("Importing game from RAWG: {}", rawgGameId);
        RawgDTO.GameDetail rawgGame = rawgService.getGameDetails(rawgGameId);

        return importGameFromRawg(rawgGame);
    }

    @Transactional
    public Game importGameFromRawg(RawgDTO.GameDetail rawgGame) {
        Game game = new Game();
        game.setId(rawgGame.getId());
        game.setTitle(rawgGame.getName());
        game.setDescription(rawgGame.getDescriptionRaw() != null ?
                rawgGame.getDescriptionRaw() : rawgGame.getDescription());

        if (rawgGame.getReleased() != null && !rawgGame.getReleased().isEmpty()) {
            try {
                game.setReleaseYear(Year.parse(rawgGame.getReleased().substring(0, 4)).getValue());
            } catch (Exception e) {
                log.warn("Could not parse release year: {}", rawgGame.getReleased());
            }
        }

        if (rawgGame.getDevelopers() != null && !rawgGame.getDevelopers().isEmpty()) {
            game.setDeveloper(rawgGame.getDevelopers().get(0).getName());
        }

        if (rawgGame.getPublishers() != null && !rawgGame.getPublishers().isEmpty()) {
            game.setPublisher(rawgGame.getPublishers().get(0).getName());
        }

        game.setCoverImageUrl(rawgGame.getBackgroundImage());

        Set<Genre> genres = new HashSet<>();
        if (rawgGame.getGenres() != null) {
            for (RawgDTO.GenreInfo genreInfo : rawgGame.getGenres()) {
                Genre genre = genreRepository.findByName(genreInfo.getName())
                        .orElseGet(() -> {
                            Genre newGenre = new Genre();
                            newGenre.setName(genreInfo.getName());
                            return genreRepository.save(newGenre);
                        });
                genres.add(genre);
            }
        }
        game.setGenres(genres);


        Set<Platform> platforms = new HashSet<>();
        if (rawgGame.getPlatforms() != null) {
            for (RawgDTO.PlatformInfo platformInfo : rawgGame.getPlatforms()) {
                Platform platform = platformRepository.findByName(platformInfo.getPlatform().getName())
                        .orElseGet(() -> {
                            Platform newPlatform = new Platform();
                            newPlatform.setName(platformInfo.getPlatform().getName());
                            return platformRepository.save(newPlatform);
                        });
                platforms.add(platform);
            }
        }
        game.setPlatforms(platforms);

        return gameRepository.save(game);
    }

    public RawgDTO.GameSearchResponse getPopularGames(Integer page, Integer pageSize) {
        return rawgService.getPopularGames(page, pageSize);
    }

    public RawgDTO.GameSearchResponse getRecentGames(Integer page, Integer pageSize) {
        return rawgService.getRecentGames(page, pageSize);
    }

    public Optional<Game> getGameById(Long id) {
        return gameRepository.findById(id);
    }
}