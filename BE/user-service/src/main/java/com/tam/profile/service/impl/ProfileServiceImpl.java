package com.tam.profile.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tam.profile.dto.request.AddressRequest;
import com.tam.profile.dto.request.ProfileCompletionRequest;
import com.tam.profile.dto.request.ProfileCreationRequest;
import com.tam.profile.dto.request.ProfileUpdateRequest;
import com.tam.profile.dto.response.ProfileResponse;
import com.tam.profile.entity.Address;
import com.tam.profile.entity.Profile;
import com.tam.profile.mapper.ProfileMapper;
import com.tam.profile.repository.ProfileRepository;
import com.tam.profile.service.ProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileServiceImpl implements ProfileService {
    ProfileRepository profileRepository;
    ProfileMapper profileMapper;

    @Override
    public ProfileResponse createProfile(ProfileCreationRequest request) {
        log.info("Creating profile with userName: {}", request.getUserName());

        if (profileRepository.existsByUserName(request.getUserName())) {
            throw new RuntimeException("Người dùng đã tồn tại");
        }

        Profile profile = profileMapper.toProfile(request);
        if (request.getUserId() != null && !request.getUserId().isBlank()) {
            profile.setUserId(request.getUserId());
        }
        profile = profileRepository.save(profile);

        log.info("Profile created successfully with id: {}", profile.getId());
        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse getProfileByUserName(String userName) {
        log.info("Getting profile with userName: {}", userName);

        Profile profile = profileRepository
                .findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse getProfileByUserId(String userId) {
        log.info("Getting profile with userId: {}", userId);

        Profile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse getInfo() {
        log.info("Getting current user info from SecurityContext");

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        Profile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse updateProfile(String userName, ProfileUpdateRequest request) {
        log.info("Updating profile for userName: {}", userName);

        String currentUser =
                SecurityContextHolder.getContext().getAuthentication().getName();

        if (!userName.equals(currentUser)) {
            throw new RuntimeException("Bạn không có quyền cập nhật profile của người dùng khác");
        }

        Profile profile = profileRepository
                .findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        profileMapper.updateProfileFromRequest(request, profile);
        profile = profileRepository.save(profile);

        log.info("Profile updated successfully for userName: {}", userName);
        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse completeProfile(ProfileCompletionRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Completing profile for userId: {}", userId);

        Profile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setEmail(request.getEmail());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setGender(request.getGender());

        if (request.getDob() != null && !request.getDob().isBlank()) {
            profile.setDob(LocalDate.parse(request.getDob()));
        }

        List<Address> addresses = new ArrayList<>();
        boolean hasDefault = request.getAddresses().stream().anyMatch(a -> Boolean.TRUE.equals(a.getIsDefault()));
        for (int i = 0; i < request.getAddresses().size(); i++) {
            AddressRequest ar = request.getAddresses().get(i);
            Address address = profileMapper.toAddress(ar);
            address.setId(UUID.randomUUID().toString());
            address.setIsActive(true);
            if (!hasDefault && i == 0) {
                address.setIsDefault(true);
            }
            addresses.add(address);
        }
        profile.setAddresses(addresses);
        profile.setIsActive(true);

        profile = profileRepository.save(profile);
        log.info("Profile completed for userId: {}", userId);
        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse updateAvatar(String avatarUrl) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Profile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        profile.setAvatar(avatarUrl);
        profile = profileRepository.save(profile);
        return profileMapper.toProfileResponse(profile);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Page<ProfileResponse> getAllProfiles(Pageable pageable) {
        log.info("Getting all profiles with pagination: {}", pageable);

        Page<Profile> profiles = profileRepository.findAll(pageable);
        return profiles.map(profileMapper::toProfileResponse);
    }

    @Override
    public Page<ProfileResponse> searchProfilesByName(String searchKey, Pageable pageable) {
        log.info("Searching profiles by name: {}", searchKey);

        Page<Profile> profiles = profileRepository.findAllByFirstNameOrLastName(searchKey, pageable);

        return profiles.map(profileMapper::toProfileResponse);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProfile(String userName) {
        log.info("Deleting profile with userName: {}", userName);

        Profile profile = profileRepository
                .findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        profileRepository.delete(profile);

        log.info("Profile deleted successfully with userName: {}", userName);
    }

    @Override
    public boolean existsByUserName(String userName) {
        return profileRepository.existsByUserName(userName);
    }

    @Override
    public long countProfiles() {
        return profileRepository.count();
    }
}
