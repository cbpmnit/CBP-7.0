package com.cbp7.auth.security;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtProvider {

    private final String jwtSecret;
    private final long jwtExpiration;

    public JwtProvider(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration}") long jwtExpiration
    ) {
        this.jwtSecret = jwtSecret;
        this.jwtExpiration = jwtExpiration;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        String primaryRole = user.getRole() != null ? user.getRole().name() : "ROLE_STUDENT";

        Set<String> roleNames = new HashSet<>();
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            roleNames = user.getRoles().stream().map(Role::name).collect(Collectors.toSet());
        }
        roleNames.add(primaryRole);

        Set<String> perms = user.getPermissions() != null ? user.getPermissions() : Collections.emptySet();

        List<String> authorities = new ArrayList<>(roleNames);
        authorities.addAll(perms);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("studentId", user.getStudentId() != null ? user.getStudentId() : "")
                .claim("email", user.getEmail())
                .claim("role", primaryRole)
                .claim("roles", new ArrayList<>(roleNames))
                .claim("permissions", new ArrayList<>(perms))
                .claim("authorities", authorities)
                .claim("name", user.getName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractSubject(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractStudentId(String token) {
        return extractSubject(token);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(String token) {
        Claims claims = extractAllClaims(token);
        Object permsObj = claims.get("permissions");
        if (permsObj instanceof List<?>) {
            return (List<String>) permsObj;
        }
        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List<?>) {
            return (List<String>) rolesObj;
        }
        String singleRole = claims.get("role", String.class);
        if (singleRole != null) {
            return List.of(singleRole);
        }
        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token);
        Object authObj = claims.get("authorities");
        if (authObj instanceof List<?>) {
            return (List<String>) authObj;
        }
        List<String> combined = new ArrayList<>(extractRoles(token));
        combined.addAll(extractPermissions(token));
        return combined;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
