package tam.userservice.dtos.req;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import tam.userservice.entities.Address;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UserProfileRequest {
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
    List<Address> addresses;
}
