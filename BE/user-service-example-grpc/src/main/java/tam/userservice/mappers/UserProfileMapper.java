package tam.userservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tam.userservice.dtos.req.UserProfileRequest;
import tam.userservice.dtos.res.UserProfileResponse;
import tam.userservice.entities.User;

@Mapper(componentModel = "spring", uses = { AddressMapper.class })
public interface UserProfileMapper {
    @Mapping(target = "isActive", ignore = true)
    User toUser(UserProfileRequest request);

    @Mapping(target = "addresses", source = "addresses")
    UserProfileResponse toUserProfileResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "identityUserId", ignore = true)
    @Mapping(target = "addresses", ignore = true)
    void updateUser(@MappingTarget User user, UserProfileRequest request);
}
