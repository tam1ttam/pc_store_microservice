package com.tam.profile.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.tam.profile.dto.request.ProfileCompletionRequest;
import com.tam.profile.dto.request.ProfileCreationRequest;
import com.tam.profile.dto.request.ProfileUpdateRequest;
import com.tam.profile.dto.response.ProfileResponse;

public interface ProfileService {
    ProfileResponse createProfile(ProfileCreationRequest request);

    ProfileResponse getProfileByUserName(String userName);

    ProfileResponse getProfileByUserId(String userId);

    ProfileResponse getInfo();

    ProfileResponse updateProfile(String userName, ProfileUpdateRequest request);

    ProfileResponse completeProfile(ProfileCompletionRequest request);

    ProfileResponse updateAvatar(String avatarUrl);

    Page<ProfileResponse> getAllProfiles(Pageable pageable);

    Page<ProfileResponse> searchProfilesByName(String searchKey, Pageable pageable);

    void deleteProfile(String userName);

    boolean existsByUserName(String userName);

    long countProfiles();
}
