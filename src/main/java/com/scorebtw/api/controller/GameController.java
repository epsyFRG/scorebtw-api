package com.scorebtw.api.controller;

import com.scorebtw.api.entity.Game;
import com.scorebtw.api.payload.RawgDTO;
import com.scorebtw.api.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping("/search")
    public ResponseEntity<RawgDTO.GameSearchResponse> searchGames(
            @RequestParam String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize
    ) {
        RawgDTO.GameSearchResponse response = gameService.searchGamesFromRawg(q, page, pageSize);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular")
    public ResponseEntity<RawgDTO.GameSearchResponse> getPopularGames(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize
    ) {
        RawgDTO.GameSearchResponse response = gameService.getPopularGames(page, pageSize);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    public ResponseEntity<RawgDTO.GameSearchResponse> getRecentGames(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize
    ) {
        RawgDTO.GameSearchResponse response = gameService.getRecentGames(page, pageSize);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Game> getGame(@PathVariable Long id) {
        Game game = gameService.getOrImportGame(id);
        return ResponseEntity.ok(game);
    }
}
