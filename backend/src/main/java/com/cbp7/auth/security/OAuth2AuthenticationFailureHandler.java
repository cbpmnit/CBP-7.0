package com.cbp7.auth.security;

import com.cbp7.common.config.FrontendProperties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private final FrontendProperties frontendProperties;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        String msg = exception.getMessage() != null ? exception.getMessage().toLowerCase() : "";
        String errorCode = "google_failed";

        if (msg.contains("access_denied") || msg.contains("cancel")) {
            errorCode = "google_cancelled";
        } else if (msg.contains("create") || msg.contains("user")) {
            errorCode = "account_creation_failed";
        } else if (msg.contains("jwt") || msg.contains("token") || msg.contains("session")) {
            errorCode = "session_failed";
        }

        log.warn("Google authentication failed: {}", exception.getMessage());
        String redirectUrl = frontendProperties.buildUrl("/login?error=" + errorCode);
        log.info("Frontend redirect URL: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}
