package tam.userservice.dtos.res;

import lombok.Builder;
import lombok.Getter;
import tam.userservice.entities.User;

import java.time.LocalDate;

@Getter
@Builder
public class UserProfileResponse {
    private String id;
    private String identityUserId;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private String gender;
    private LocalDate dateOfBirth;
    private String avatar;
    private Boolean isActive;

    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .identityUserId(user.getIdentityUserId())
                .phoneNumber(user.getDefaultPhoneNumber())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .avatar(user.getAvatar())
                .isActive(user.getIsActive())
                .build();
    }
}