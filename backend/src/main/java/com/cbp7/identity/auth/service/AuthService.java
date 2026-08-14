package com.cbp7.identity.auth.service;

import com.cbp7.identity.auth.dto.request.ChangePasswordRequest;
import com.cbp7.identity.auth.dto.request.CompleteAccountRequest;
import com.cbp7.identity.auth.dto.request.LoginRequest;
import com.cbp7.identity.auth.dto.request.ProfileUpdateRequest;
import com.cbp7.identity.auth.dto.request.RegisterRequest;
import com.cbp7.identity.auth.dto.request.SetupPasswordRequest;
import com.cbp7.identity.auth.dto.response.LoginResponse;
import com.cbp7.identity.auth.dto.response.UserResponse;
import com.cbp7.identity.auth.entity.User;

import java.util.Optional;

public interface AuthService {
    String register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    Optional<User> findUserByIdentifier(String identifier);
    String processGoogleUser(String email, String name, String sub);
    LoginResponse completeAccount(User currentUser, CompleteAccountRequest request);
    LoginResponse setupPassword(User currentUser, SetupPasswordRequest request);
    String changePassword(User currentUser, ChangePasswordRequest request);
    String logout();
    UserResponse getCurrentUser(User user);
    UserResponse updateProfile(User currentUser, ProfileUpdateRequest request);
}
