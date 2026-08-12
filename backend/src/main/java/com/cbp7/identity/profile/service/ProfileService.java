package com.cbp7.identity.profile.service;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.dto.request.CreateProfileRequest;
import com.cbp7.identity.profile.dto.request.UpdateProfileRequest;
import com.cbp7.identity.profile.dto.response.ProfileCompletionResponse;
import com.cbp7.identity.profile.dto.response.ProfileResponse;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import com.cbp7.identity.profile.entity.UserProfile;

public interface ProfileService {
    ProfileResponse getProfile(User user);
    ProfileResponse createProfile(User user, CreateProfileRequest request);
    ProfileResponse updateProfile(User user, UpdateProfileRequest request);
    ProfileCompletionResponse getProfileCompletion(User user);
    ProfileCompletion calculateAndBuildCompletion(User user, UserProfile profile);
}
