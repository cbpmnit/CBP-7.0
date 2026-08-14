package com.cbp7.identity.auth;

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
        String clean = rawIdentifier.trim().toLowerCase();

        if (clean.contains("@")) {
            log.debug("Searching user by email: {}", clean);
            Optional<User> byEmail = userRepository.findByEmailIgnoreCase(clean);
            if (byEmail.isPresent()) {
                return byEmail;
            }
            return userRepository.findByStudentIdIgnoreCase(clean);
        } else {
            log.debug("Searching user by student ID: {}", clean);
            Optional<User> byStudentId = userRepository.findByStudentIdIgnoreCase(clean);
            if (byStudentId.isPresent()) {
                return byStudentId;
            }
            return userRepository.findByEmailIgnoreCase(clean);
        }
    }
}
