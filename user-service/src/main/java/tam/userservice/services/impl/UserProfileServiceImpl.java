package tam.userservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import tam.common.exceptions.ConflictException;
import tam.common.exceptions.ResourceNotFoundException;
import tam.userservice.entities.User;
import tam.userservice.repositories.UserRepository;
import tam.userservice.services.UserProfileService;

import java.time.LocalDate;

@Service
@FieldDefaults(makeFinal = true)
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {
    private final UserRepository userRepository;

    @Override
    public String createUserProfile(String identityUserId, String phoneNumber, String email,
            String firstName, String lastName, String gender,
            LocalDate dateOfBirth, String avatar) {
        // Check if identity already exists
        if (userRepository.existsByIdentityUserId(identityUserId)) {
            throw new ConflictException("Identity user already exists");
        }

        // Check if phone number already exists
        if (userRepository.existsByDefaultPhoneNumber(phoneNumber)) {
            throw new ConflictException("Phone number already exists");
        }

        // Check if email already exists
        if (email != null && !email.isBlank() && userRepository.existsByDefaultEmail(email)) {
            throw new ConflictException("Email already exists");
        }

        User user = User.builder()
                .identityUserId(identityUserId)
                .defaultPhoneNumber(phoneNumber)
                .defaultEmail(email != null ? email : "")
                .firstName(firstName)
                .lastName(lastName)
                .gender(gender)
                .dateOfBirth(dateOfBirth)
                .avatar(avatar)
                .isActive(true)
                .build();

        return userRepository.save(user).getId();
    }

    @Override
    public boolean deleteUserProfileByIdentityUserId(String identityUserId) {
        if (!userRepository.existsByIdentityUserId(identityUserId)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteByIdentityUserId(identityUserId);
        return true;
    }

    @Override
    public boolean updateUserProfile(String identityUserId, String phoneNumber, String email,
            String firstName, String lastName, String gender,
            LocalDate dateOfBirth, String avatar) {
        User user = userRepository.findByIdentityUserId(identityUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check phone number uniqueness (if changed)
        if (!user.getDefaultPhoneNumber().equals(phoneNumber) &&
                userRepository.existsByDefaultPhoneNumber(phoneNumber)) {
            throw new ConflictException("Phone number already exists");
        }

        // Check email uniqueness (if changed)
        if (email != null && !email.isBlank() &&
                !user.getDefaultEmail().equals(email) &&
                userRepository.existsByDefaultEmail(email)) {
            throw new ConflictException("Email already exists");
        }

        user.setDefaultPhoneNumber(phoneNumber);
        user.setDefaultEmail(email != null ? email : "");
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setGender(gender);
        user.setDateOfBirth(dateOfBirth);
        user.setAvatar(avatar);

        userRepository.save(user);
        return true;
    }

    @Override
    public User getUserProfileByIdentityUserId(String identityUserId) {
        return userRepository.findByIdentityUserId(identityUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
