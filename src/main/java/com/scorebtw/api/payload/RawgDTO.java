package com.scorebtw.api.payload;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

public class RawgDTO {

    @Data
    public static class GameSearchResponse {
        private Integer count;
        private String next;
        private String previous;
        private List<GameResult> results;
    }

    @Data
    public static class GameResult {
        private Long id;
        private String slug;
        private String name;
        private String released;

        @JsonProperty("background_image")
        private String backgroundImage;

        private Double rating;

        @JsonProperty("ratings_count")
        private Integer ratingsCount;

        private List<PlatformInfo> platforms;
        private List<GenreInfo> genres;

        @JsonProperty("metacritic")
        private Integer metacriticScore;
    }

    @Data
    public static class GameDetail {
        private Long id;
        private String slug;
        private String name;

        @JsonProperty("name_original")
        private String nameOriginal;

        private String description;

        @JsonProperty("description_raw")
        private String descriptionRaw;

        private String released;

        @JsonProperty("background_image")
        private String backgroundImage;

        @JsonProperty("background_image_additional")
        private String backgroundImageAdditional;

        private Double rating;

        @JsonProperty("ratings_count")
        private Integer ratingsCount;

        private List<PlatformInfo> platforms;
        private List<GenreInfo> genres;
        private List<Developer> developers;
        private List<Publisher> publishers;

        @JsonProperty("metacritic")
        private Integer metacriticScore;
    }

    @Data
    public static class PlatformInfo {
        private Platform platform;

        @JsonProperty("released_at")
        private String releasedAt;
    }

    @Data
    public static class Platform {
        private Long id;
        private String name;
        private String slug;
    }

    @Data
    public static class GenreInfo {
        private Long id;
        private String name;
        private String slug;
    }

    @Data
    public static class Developer {
        private Long id;
        private String name;
        private String slug;
    }

    @Data
    public static class Publisher {
        private Long id;
        private String name;
        private String slug;
    }
}