package tam.userservice.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@ToString
@EqualsAndHashCode
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    String id;

    @Column(nullable = false, unique = true, length = 100)
    @EqualsAndHashCode.Include
    String identityUserId;

    @Column(nullable = false, unique = true, length = 20)
    String defaultPhoneNumber;

    @Column(nullable = false, unique = true, length = 20)
    String defaultEmail;

    @Column(nullable = false, length = 100)
    String firstName;

    @Column(nullable = false, length = 100)
    String lastName;

    @Column(nullable = false, length = 20)
    String gender;

    @Column(nullable = false)
    LocalDate dateOfBirth;

    @Column
    String avatar;

    @Column(nullable = false)
    @Builder.Default
    Boolean isActive = true;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Address> addresses;
}
