package com.cbp7.identity.auth.security;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = parseJwt(request);

        if (StringUtils.hasText(token) && jwtProvider.validateToken(token)) {
            String subject = jwtProvider.extractSubject(token);

            if (StringUtils.hasText(subject)) {
                Optional<User> userOpt = userRepository.findByEmailIgnoreCase(subject)
                        .or(() -> userRepository.findByStudentIdIgnoreCase(subject));

                userOpt.ifPresent(user -> {
                    if (Boolean.TRUE.equals(user.getEnabled())) {
                        Set<String> authStrings = new LinkedHashSet<>();
                        if (user.getRole() != null) {
                            authStrings.add(user.getRole().name());
                        }
                        if (user.getRoles() != null) {
                            for (Role r : user.getRoles()) {
                                authStrings.add(r.name());
                            }
                        }
                        if (user.getPermissions() != null) {
                            for (String perm : user.getPermissions()) {
                                if (perm != null && !perm.isBlank()) {
                                    authStrings.add(perm.trim());
                                }
                            }
                        }

                        List<SimpleGrantedAuthority> grantedAuthorities = authStrings.stream()
                                .map(SimpleGrantedAuthority::new)
                                .toList();

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                grantedAuthorities
                        );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        log.debug("Authenticated user: email={}, role={}, authorities={}", user.getEmail(), user.getRole(), authStrings);
                    }
                });
            }
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
