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
        String errorCode = "oauth_unknown_error";

        if (msg.contains("access_denied") || msg.contains("cancel")) {
            errorCode = "oauth_cancelled";
        } else if (msg.contains("invalid_token") || msg.contains("provider") || msg.contains("invalid_grant") || msg.contains("authorization")) {
            errorCode = "oauth_provider_error";
        } else if (msg.contains("database") || msg.contains("sql") || msg.contains("jpa")) {
            errorCode = "oauth_database_error";
        } else if (msg.contains("create") || msg.contains("user")) {
            errorCode = "oauth_account_creation_failed";
        } else if (msg.contains("jwt") || msg.contains("token") || msg.contains("session")) {
            errorCode = "oauth_token_generation_failed";
        }

        log.error("Google OAuth authentication failed: errorCode={}, internalMessage={}", errorCode, exception.getMessage(), exception);
        String redirectUrl = frontendProperties.buildUrl("/login?error=" + errorCode);
        log.info("Frontend redirect URL: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}
