package com.cbp7.identity.auth.identity;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserIdentityResolver {

    private final UserRepository userRepository;

    public Optional<User> resolveUser(AuthenticationIdentifier identifier) {
        if (identifier == null) {
            return Optional.empty();
        }

        switch (identifier.getType()) {
            case EMAIL:
            case GOOGLE_OAUTH:
            case MNIT_INSTITUTIONAL_OAUTH:
            case MICROSOFT_OAUTH:
                log.debug("Resolving user by email: {}", identifier.getRawValue());
                return userRepository.findByEmailIgnoreCase(identifier.getRawValue());

            case STUDENT_ID:
            default:
                log.debug("Resolving user by student ID: {}", identifier.getRawValue());
                return userRepository.findByStudentIdIgnoreCase(identifier.getRawValue());
        }
    }

    public Optional<User> findUserByIdentifier(String rawIdentifier) {
        if (rawIdentifier == null || rawIdentifier.isBlank()) {
            return Optional.empty();
        }
        AuthenticationIdentifier authIdentifier = AuthenticationIdentifier.parse(rawIdentifier);
        return resolveUser(authIdentifier);
    }
}
