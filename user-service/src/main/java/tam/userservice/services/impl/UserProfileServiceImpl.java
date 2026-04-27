package tam.userservice.services.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tam.userservice.dtos.req.AddressRequest;
import tam.userservice.dtos.req.UserProfileRequest;
import tam.userservice.dtos.res.UserProfileResponse;
import tam.userservice.entities.Address;
import tam.userservice.entities.User;
import tam.userservice.mappers.AddressMapper;
import tam.userservice.mappers.UserProfileMapper;
import tam.userservice.repositories.UserRepository;
import tam.userservice.services.UserProfileService;

import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {
    UserRepository userRepository;
    UserProfileMapper userProfileMapper;
    AddressMapper addressMapper;

    @Override
    public String createUserProfile(UserProfileRequest request) {
        User savedUser = null;
        try {
            User user = userProfileMapper.toUser(request);
            System.out.println("user in service impl: " + user.toString());
            savedUser = userRepository.save(user);
            log.info("User profile created successfully for identity user: {}", request.getIdentityUserId());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return savedUser.getId();
    }

    @Override
    public boolean deleteUserProfileByIdentityUserId(String identityUserId) {
        userRepository.deleteByIdentityUserId(identityUserId);
        log.info("User profile deleted successfully for identity user: {}", identityUserId);
        return true;
    }

    @Override
    public boolean updateUserProfile(UserProfileRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElse(null);
        if (Objects.isNull(user))
            return false;

        if (!user.getDefaultEmail().equals(request.getDefaultEmail()) &&
                userRepository.existsByDefaultEmail(request.getDefaultEmail())) {
            return false;
        }
        if (!user.getDefaultPhoneNumber().equals(request.getDefaultPhoneNumber()) &&
                userRepository.existsByDefaultPhoneNumber(request.getDefaultPhoneNumber())) {
            return false;
        }

        userProfileMapper.updateUser(user, request);
        userRepository.save(user);
        log.info("User profile updated successfully for user: {}", userId);
        return true;
    }

    @Override
    public boolean updateAddress(AddressRequest addressRequest, String userId) {
        User user = userRepository.findById(userId)
                .orElse(null);
        if (Objects.isNull(user))
            return false;
        Address address;
        if (addressRequest.getId() != null) {
            address = user.getAddresses().stream()
                    .filter(a -> a.getId().equals(addressRequest.getId()))
                    .findFirst()
                    .orElse(null);
            addressMapper.updateAddress(address, addressRequest);
        } else {
            address = addressMapper.toAddress(addressRequest);
            address.setUser(user);
            user.getAddresses().add(address);
        }
        userRepository.save(user);
        log.info("Address updated/created successfully for user: {}", userId);
        return true;
    }

    @Override
    public Optional<UserProfileResponse> getUserProfileByIdentityUserId(String identityUserId) {
        return userRepository.findByIdentityUserId(identityUserId)
                .map(userProfileMapper::toUserProfileResponse);
    }

    @Override
    public Optional<UserProfileResponse> getUserProfileByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(userProfileMapper::toUserProfileResponse);
    }
}
