package com.cbp7.volunteer.resolver;

import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.repository.VolunteerInvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class VolunteerIdentityResolver {

    private final UserRepository userRepository;
    private final VolunteerInvitationRepository invitationRepository;

    public User findUserByIdentifier(String identifier) {
        return findOptionalUser(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User account not found for identifier: " + identifier));
    }

    public Optional<User> findOptionalUser(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        String clean = identifier.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(clean);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentIdIgnoreCase(clean);
        }
        if (userOpt.isEmpty()) {
            try {
                UUID uuid = UUID.fromString(clean);
                userOpt = userRepository.findById(uuid);
            } catch (Exception ignored) {}
        }
        return userOpt;
    }

    public Optional<VolunteerInvitation> findOptionalInvitation(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        String clean = identifier.trim().toLowerCase();
        try {
            UUID uuid = UUID.fromString(clean);
            Optional<VolunteerInvitation> invOpt = invitationRepository.findById(uuid);
            if (invOpt.isPresent()) {
                return invOpt;
            }
        } catch (Exception ignored) {}

        return invitationRepository.findByEmailIgnoreCase(clean);
    }
}
