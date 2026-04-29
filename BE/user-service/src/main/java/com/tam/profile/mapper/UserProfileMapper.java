package com.tam.profile.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.tam.profile.dto.request.ProfileCreationRequest;
import com.tam.profile.dto.request.UpdateProfileRequest;
import com.tam.profile.dto.response.UserProfileResponse;
import com.tam.profile.entity.UserProfile;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfile toUserProfile(ProfileCreationRequest request);

    UserProfileResponse toUserProfileResponse(UserProfile entity);

    void update(@MappingTarget UserProfile entity, UpdateProfileRequest request);
}
