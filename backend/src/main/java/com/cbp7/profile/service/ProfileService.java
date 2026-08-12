package com.cbp7.profile.service;

import com.cbp7.auth.entity.User;
import com.cbp7.profile.dto.request.CreateProfileRequest;
import com.cbp7.profile.dto.request.UpdateProfileRequest;
import com.cbp7.profile.dto.response.ProfileCompletionResponse;
import com.cbp7.profile.dto.response.ProfileResponse;
import com.cbp7.profile.entity.ProfileCompletion;
import com.cbp7.profile.entity.UserProfile;

public interface ProfileService {
    ProfileResponse getProfile(User user);
    ProfileResponse createProfile(User user, CreateProfileRequest request);
    ProfileResponse updateProfile(User user, UpdateProfileRequest request);
    ProfileCompletionResponse getProfileCompletion(User user);
    ProfileCompletion calculateAndBuildCompletion(User user, UserProfile profile);
}
