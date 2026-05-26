package com.tam.profile.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.tam.profile.dto.request.AddressRequest;
import com.tam.profile.dto.request.ProfileCreationRequest;
import com.tam.profile.dto.request.ProfileUpdateRequest;
import com.tam.profile.dto.response.AddressResponse;
import com.tam.profile.dto.response.ProfileResponse;
import com.tam.profile.entity.Address;
import com.tam.profile.entity.Profile;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProfileMapper {

    Profile toProfile(ProfileCreationRequest request);

    @Mapping(target = "id", expression = "java(profile.getId().toString())")
    @Mapping(target = "dob", expression = "java(profile.getDob() != null ? profile.getDob().toString() : null)")
    ProfileResponse toProfileResponse(Profile profile);

    AddressResponse toAddressResponse(Address address);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Address toAddress(AddressRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userName", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "addresses", ignore = true)
    void updateProfileFromRequest(ProfileUpdateRequest request, @MappingTarget Profile profile);
}
