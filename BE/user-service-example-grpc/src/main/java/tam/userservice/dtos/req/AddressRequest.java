package tam.userservice.dtos.req;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressRequest {
    String id;
    String country;
    String province; // tinh/bang
    String city;
    String ward;
    String street;
    Boolean isDefault;
    List<String> phoneContacts;
    Boolean isActive = true;
}
