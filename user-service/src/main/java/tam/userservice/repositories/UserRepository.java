package tam.userservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import tam.userservice.entities.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {

    boolean existsByIdentityUserId(String identityUserId);

    boolean existsByDefaultPhoneNumber(String phoneNumber);

    boolean existsByDefaultEmail(String email);

    Optional<User> findByIdentityUserId(String identityUserId);

    Optional<User> findByDefaultPhoneNumber(String phoneNumber);

    Optional<User> findByDefaultEmail(String email);

    Optional<User> findByUsername(String username);

    void deleteByIdentityUserId(String identityUserId);
}
