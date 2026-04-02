package tam.userservice.services;


import org.springframework.data.domain.Page;
import tam.userservice.entities.User;

import java.time.LocalDate;

public interface UserProfileService {
    Long createUserProfile(
            String identityUserId,
            String phoneNumber,
            String firstName,
            String lastName,
            String gender,
            LocalDate dateOfBirth
    );

    boolean deleteUserProfileByIdentityUserId(String identityUserId);

    User getAuthenticatedUserProfile(String identityUserId);

    User getUserProfileByIdentityUserId(String identityUserId);

    Page<User> searchUsers(
            int page,
            int limit,
            String sortBy,
            String search,
            String keyword
    );
}
