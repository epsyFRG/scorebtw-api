package com.scorebtw.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24 * 7; // 7 giorni

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean usernameMatches = username.equals(userDetails.getUsername());
            boolean notExpired = !isTokenExpired(token);
            boolean isValid = usernameMatches && notExpired;
            
            // Log per debug (solo se non valido)
            if (!isValid) {
                System.out.println("JwtUtil - Token validation failed:");
                System.out.println("  Username from token: " + username);
                System.out.println("  Username from UserDetails: " + userDetails.getUsername());
                System.out.println("  Username matches: " + usernameMatches);
                System.out.println("  Token expired: " + isTokenExpired(token));
                System.out.println("  Token expiration: " + extractExpiration(token));
                System.out.println("  Current time: " + new Date());
            }
            
            return isValid;
        } catch (Exception e) {
            System.err.println("JwtUtil - Token validation exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}