package tam.userservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tam.userservice.dtos.req.UserProfileRequest;
import tam.userservice.dtos.res.UserProfileResponse;
import tam.userservice.entities.User;

@Mapper(componentModel = "spring", uses = {AddressMapper.class})
public interface UserProfileMapper {
    @Mapping(target = "isActive", ignore = true)
    User toUser(UserProfileRequest request);
    UserProfileResponse toUserProfileResponse(User user);
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "identityUserId", ignore = true) // Thường không cho cập nhật ID định danh
    @Mapping(target = "addresses", ignore = true) // Address thường được xử lý riêng bằng logic thêm/xóa
    void updateUser(@MappingTarget User user, UserProfileRequest request);
}
