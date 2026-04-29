package tam.userservice.dtos.res;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileResponse {
    String id;
    String identityUserId;
    String defaultPhoneNumber;
    String defaultEmail;
    String firstName;
    String lastName;
    String gender;
    LocalDate dateOfBirth;
    String avatar;
    Boolean isActive;
    List<AddressResponse> addresses;
}