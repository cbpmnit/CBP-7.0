package com.cbp7.platform.volunteer.helper;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class VolunteerAccountProvisioner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createNewVolunteerUser(String email, String name, Set<String> perms, String rawPassword) {
        String baseId = "vol_" + email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String studentId = baseId;
        int count = 1;
        while (userRepository.existsByStudentId(studentId)) {
            studentId = baseId + count++;
        }

        User user = User.builder()
                .studentId(studentId)
                .email(email)
                .name(name != null && !name.isBlank() ? name.trim() : email.split("@")[0])
                .password(passwordEncoder.encode(rawPassword.trim()))
                .role(Role.ROLE_VOLUNTEER)
                .roles(new HashSet<>(List.of(Role.ROLE_VOLUNTEER)))
                .enabled(true)
                .permissions(perms)
                .build();

        return userRepository.save(user);
    }

    public User activateExistingUser(User user, Set<String> perms, String rawPassword) {
        if (!user.hasRole(Role.ROLE_ADMIN)) {
            user.setRole(Role.ROLE_VOLUNTEER);
        }
        user.addRole(Role.ROLE_VOLUNTEER);
        user.setPermissions(perms);
        if (rawPassword != null && !rawPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(rawPassword.trim()));
        }
        user.setEnabled(true);
        return userRepository.save(user);
    }

    public User upgradeUserToVolunteer(User user, String name, Set<String> permissions) {
        if (!user.hasRole(Role.ROLE_ADMIN)) {
            user.setRole(Role.ROLE_VOLUNTEER);
        }
        user.addRole(Role.ROLE_VOLUNTEER);
        user.setPermissions(permissions);
        user.setEnabled(true);
        if (name != null && !name.isBlank() && (user.getName() == null || user.getName().isBlank())) {
            user.setName(name.trim());
        }
        return userRepository.save(user);
    }
}
