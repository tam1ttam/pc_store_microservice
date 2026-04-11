package tam.userservice.services;

import java.time.LocalDate;

public interface UserProfileService {
    String createUserProfile(String identityUserId, String phoneNumber, String email,
            String firstName, String lastName, String gender,
            LocalDate dateOfBirth, String avatar);

    boolean deleteUserProfileByIdentityUserId(String identityUserId);

    boolean updateUserProfile(String identityUserId, String phoneNumber, String email,
            String firstName, String lastName, String gender,
            LocalDate dateOfBirth, String avatar);

    Object getUserProfileByIdentityUserId(String identityUserId);
}
