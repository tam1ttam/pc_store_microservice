package tam.userservice.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Entity
@Table(name = "addresses")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@ToString
@EqualsAndHashCode
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    String id;

    @Column(nullable = false, length = 32)
    String country;

    @Column(nullable = false, length = 64)
    String province; // tinh/bang

    @Column(nullable = false, length = 32)
    String city;

    @Column(nullable = false, length = 64)
    String ward;

    @Column(nullable = false, length = 128)
    String street;

    @Column(nullable = false)
    Boolean isDefault;

    @ElementCollection
    @CollectionTable(
            name = "address_phone_contacts",
            joinColumns = @JoinColumn(name = "address_id")
    )
    @Column(name = "phone_number")
    Set<String> phoneContacts;

    @Column(nullable = false)
    @Builder.Default
    Boolean isActive = true;
    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;
}
