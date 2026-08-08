package com.cbp7.auth.identity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@AllArgsConstructor
@ToString
public class AuthenticationIdentifier {

    private final String rawValue;
    private final IdentifierType type;

    public static AuthenticationIdentifier parse(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Authentication identifier cannot be null or empty");
        }

        String clean = input.trim();
        if (clean.contains("@")) {
            return new AuthenticationIdentifier(clean.toLowerCase(), IdentifierType.EMAIL);
        } else {
            return new AuthenticationIdentifier(clean.toLowerCase(), IdentifierType.STUDENT_ID);
        }
    }

    public static AuthenticationIdentifier forOAuth(String subjectOrEmail, IdentifierType oauthType) {
        if (subjectOrEmail == null || subjectOrEmail.isBlank()) {
            throw new IllegalArgumentException("OAuth identifier cannot be null or empty");
        }
        return new AuthenticationIdentifier(subjectOrEmail.trim().toLowerCase(), oauthType);
    }
}
