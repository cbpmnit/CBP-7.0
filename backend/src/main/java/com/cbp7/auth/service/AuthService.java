package com.cbp7.auth.service;

import com.cbp7.auth.dto.request.LoginRequest;
import com.cbp7.auth.dto.request.ProfileUpdateRequest;
import com.cbp7.auth.dto.request.RegisterRequest;
import com.cbp7.auth.dto.response.LoginResponse;
import com.cbp7.auth.dto.response.UserResponse;
import com.cbp7.auth.entity.User;

import java.util.Optional;

public interface AuthService {
    String register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    Optional<User> findUserByIdentifier(String identifier);
    String processGoogleUser(String email, String name, String sub);
    String logout();
    UserResponse getCurrentUser(User user);
    UserResponse updateProfile(User currentUser, ProfileUpdateRequest request);
}
