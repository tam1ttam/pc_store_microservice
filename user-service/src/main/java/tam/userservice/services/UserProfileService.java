package tam.userservice.services;

import tam.userservice.dtos.req.AddressRequest;
import tam.userservice.dtos.req.UserProfileRequest;
import tam.userservice.dtos.res.UserProfileResponse;

import java.util.Optional;

public interface UserProfileService {
    String createUserProfile(UserProfileRequest request);
    boolean deleteUserProfileByIdentityUserId(String identityUserId);
    boolean updateUserProfile(UserProfileRequest request, String userId);
    boolean updateAddress(AddressRequest addressRequest, String userId);

    Optional<UserProfileResponse> getUserProfileByIdentityUserId(String identityUserId);
}
