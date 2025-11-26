package com.scorebtw.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        
        // Log solo per le richieste POST a /api/reviews per debug
        if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
            logger.info("JwtAuthenticationFilter - Processing POST /api/reviews");
            logger.info("JwtAuthenticationFilter - Authorization header present: " + (authorizationHeader != null));
            if (authorizationHeader != null) {
                logger.info("JwtAuthenticationFilter - Authorization header starts with Bearer: " + authorizationHeader.startsWith("Bearer "));
            }
        }

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
                    logger.info("JwtAuthenticationFilter - Extracted username: " + username);
                }
            } catch (Exception e) {
                logger.error("JWT Token extraction failed: " + e.getMessage());
                if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
                    logger.error("JwtAuthenticationFilter - Token extraction error: ", e);
                }
            }
        } else if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
            logger.warn("JwtAuthenticationFilter - No valid Authorization header found for POST /api/reviews");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
                    logger.info("JwtAuthenticationFilter - UserDetails loaded for: " + username);
                    logger.info("JwtAuthenticationFilter - UserDetails authorities: " + userDetails.getAuthorities());
                }

                boolean isValid = jwtUtil.validateToken(jwt, userDetails);
                if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
                    logger.info("JwtAuthenticationFilter - Token validation result: " + isValid);
                }
                
                if (isValid) {
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
                        logger.info("JwtAuthenticationFilter - Authentication set successfully for user: " + username);
                        Authentication setAuth = SecurityContextHolder.getContext().getAuthentication();
                        logger.info("JwtAuthenticationFilter - SecurityContext authentication: " + (setAuth != null ? "SET" : "NULL"));
                        if (setAuth != null) {
                            logger.info("JwtAuthenticationFilter - SecurityContext principal: " + setAuth.getPrincipal().getClass().getName());
                            logger.info("JwtAuthenticationFilter - SecurityContext authenticated: " + setAuth.isAuthenticated());
                        }
                    }
                } else {
                    if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
                        logger.warn("JwtAuthenticationFilter - Token validation failed for user: " + username);
                    }
                }
            } catch (Exception e) {
                logger.error("JwtAuthenticationFilter - Error loading user details or validating token: ", e);
                if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
                    logger.error("JwtAuthenticationFilter - Exception details: " + e.getClass().getName() + " - " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } else if (request.getRequestURI().contains("/api/reviews") && "POST".equals(request.getMethod())) {
            if (username == null) {
                logger.warn("JwtAuthenticationFilter - Username is null, cannot authenticate");
            } else {
                Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
                logger.info("JwtAuthenticationFilter - Authentication already exists (username: " + username + ")");
                logger.info("JwtAuthenticationFilter - Existing auth: " + (existingAuth != null ? existingAuth.getName() : "null"));
            }
        }

        filterChain.doFilter(request, response);
    }
}