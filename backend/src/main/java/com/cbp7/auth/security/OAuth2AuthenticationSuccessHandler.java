package com.cbp7.auth.security;

import com.cbp7.auth.service.AuthService;
import com.cbp7.common.config.FrontendProperties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final FrontendProperties frontendProperties;

    public OAuth2AuthenticationSuccessHandler(@Lazy AuthService authService, FrontendProperties frontendProperties) {
        this.authService = authService;
        this.frontendProperties = frontendProperties;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        log.info("OAuth success handler executed");
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String sub = oAuth2User.getAttribute("sub");

            if (email == null || email.isBlank()) {
                log.error("Google OAuth2 authentication succeeded but email attribute is missing");
                String errorUrl = frontendProperties.buildUrl("/login?error=email_missing");
                log.info("Frontend redirect URL: {}", errorUrl);
                response.sendRedirect(errorUrl);
                return;
            }

            String token = authService.processGoogleUser(email, name, sub);
            String redirectUrl = frontendProperties.buildUrl("/auth/callback?token=" + token);

            log.info("Google authentication successful for email: {}", email);
            log.info("Frontend redirect URL: {}", redirectUrl);

            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            log.error("Google OAuth redirect failed", e);
            String errorUrl = frontendProperties.buildUrl("/login?error=oauth_processing_failed");
            log.info("Frontend redirect URL: {}", errorUrl);
            response.sendRedirect(errorUrl);
        }
    }
}
