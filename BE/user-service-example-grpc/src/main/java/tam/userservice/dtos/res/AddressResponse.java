package tam.userservice.dtos.res;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressResponse {
    String id;
    String country;
    String province;
    String city;
    String ward;
    String street;
    Boolean isDefault;
    List<String> phoneContacts;
    Boolean isActive;
}
