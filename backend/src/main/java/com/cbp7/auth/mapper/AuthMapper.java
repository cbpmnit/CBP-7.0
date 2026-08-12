package com.cbp7.auth.mapper;

import com.cbp7.auth.dto.response.LoginResponse;
import com.cbp7.auth.dto.response.UserResponse;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class AuthMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        String uid = user.getId() != null ? user.getId().toString() : "";
        Set<String> roleNames = extractRoleNames(user);
        Set<String> perms = user.getPermissions() != null ? user.getPermissions() : Set.of();

        return new UserResponse(
                uid,
                uid,
                user.getStudentId(),
                user.getEmail(),
                user.getName(),
                user.getPhoneNumber(),
                user.getRole() != null ? user.getRole().name() : "ROLE_STUDENT",
                roleNames,
                perms
        );
    }

    public LoginResponse toLoginResponse(User user, String token) {
        if (user == null) {
            return null;
        }

        String uid = user.getId() != null ? user.getId().toString() : "";
        Set<String> roleNames = extractRoleNames(user);

        return new LoginResponse(
                token,
                uid,
                user.getStudentId(),
                user.getName(),
                user.getRole() != null ? user.getRole().name() : "ROLE_STUDENT",
                roleNames,
                user.getPermissions() != null ? user.getPermissions() : Set.of()
        );
    }

    private Set<String> extractRoleNames(User user) {
        Set<String> roleNames = new HashSet<>();
        if (user.getRole() != null) {
            roleNames.add(user.getRole().name());
        }
        if (user.getRoles() != null) {
            for (Role r : user.getRoles()) {
                roleNames.add(r.name());
            }
        }
        return roleNames;
    }
}
