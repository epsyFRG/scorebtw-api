package com.scorebtw.api.service;

import com.scorebtw.api.payload.RawgDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class RawgService {

    private final RestTemplate restTemplate;

    @Value("${rawg.api.key}")
    private String apiKey;

    @Value("${rawg.api.url}")
    private String apiUrl;

    public RawgDTO.GameSearchResponse searchGames(String query, Integer page, Integer pageSize) {
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/games")
                .queryParam("key", apiKey)
                .queryParam("search", query)
                .queryParam("page", page != null ? page : 1)
                .queryParam("page_size", pageSize != null ? pageSize : 20)
                .toUriString();

        log.info("Searching games with query: {}", query);
        return restTemplate.getForObject(url, RawgDTO.GameSearchResponse.class);
    }

    public RawgDTO.GameDetail getGameDetails(Long gameId) {
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/games/" + gameId)
                .queryParam("key", apiKey)
                .toUriString();

        log.info("Fetching game details for ID: {}", gameId);
        return restTemplate.getForObject(url, RawgDTO.GameDetail.class);
    }

    public RawgDTO.GameSearchResponse getPopularGames(Integer page, Integer pageSize) {
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/games")
                .queryParam("key", apiKey)
                .queryParam("ordering", "-rating")
                .queryParam("page", page != null ? page : 1)
                .queryParam("page_size", pageSize != null ? pageSize : 20)
                .toUriString();

        log.info("Fetching popular games");
        return restTemplate.getForObject(url, RawgDTO.GameSearchResponse.class);
    }

    public RawgDTO.GameSearchResponse getRecentGames(Integer page, Integer pageSize) {
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/games")
                .queryParam("key", apiKey)
                .queryParam("ordering", "-released")
                .queryParam("page", page != null ? page : 1)
                .queryParam("page_size", pageSize != null ? pageSize : 20)
                .toUriString();

        log.info("Fetching recent games");
        return restTemplate.getForObject(url, RawgDTO.GameSearchResponse.class);
    }

    public RawgDTO.GameSearchResponse getGamesByGenre(String genreSlug, Integer page, Integer pageSize) {
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/games")
                .queryParam("key", apiKey)
                .queryParam("genres", genreSlug)
                .queryParam("page", page != null ? page : 1)
                .queryParam("page_size", pageSize != null ? pageSize : 20)
                .toUriString();

        log.info("Fetching games by genre: {}", genreSlug);
        return restTemplate.getForObject(url, RawgDTO.GameSearchResponse.class);
    }

    public RawgDTO.GameSearchResponse getGamesByPlatform(String platformSlug, Integer page, Integer pageSize) {
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/games")
                .queryParam("key", apiKey)
                .queryParam("platforms", platformSlug)
                .queryParam("page", page != null ? page : 1)
                .queryParam("page_size", pageSize != null ? pageSize : 20)
                .toUriString();

        log.info("Fetching games by platform: {}", platformSlug);
        return restTemplate.getForObject(url, RawgDTO.GameSearchResponse.class);
    }
}