package tam.userservice.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tam.common.base.ApiResponse;
import tam.common.constants.ApiConstant;
import tam.userservice.dtos.req.AddressRequest;
import tam.userservice.dtos.req.UserProfileRequest;
import tam.userservice.dtos.res.UserProfileResponse;
import tam.userservice.services.UserProfileService;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/user/profile")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;

    /**
     * Lấy thông tin profile người dùng theo identity user ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfileByUserId(@PathVariable String userId) {
        try {
            var response = userProfileService.getUserProfileByIdentityUserId(userId);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.<UserProfileResponse>builder()
                            .status(Integer.valueOf(ApiConstant.CODE_200))
                            .message("User profile found")
                            .data(response.get())
                            .build());
        } catch (Exception e) {
            log.error("Error retrieving user profile for userId: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.<UserProfileResponse>builder()
                            .status(Integer.valueOf(ApiConstant.CODE_404))
                            .message("User profile not found")
                            .build());
        }
    }


    /**
     * Tạo mới profile người dùng
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<String>> createProfile(@RequestBody UserProfileRequest request) {
        try {
            String userId = userProfileService.createUserProfile(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.<String>builder()
                            .status(Integer.valueOf(ApiConstant.CODE_201))
                            .message("User profile created successfully")
                            .data(userId)
                            .build());
        } catch (Exception e) {
            log.error("Error creating user profile", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.<String>builder()
                            .status(Integer.valueOf(ApiConstant.CODE_400))
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * Cập nhật thông tin profile người dùng
     */
    @PutMapping("/update/{userId}")
    public ResponseEntity<ApiResponse<String>> updateProfile(@PathVariable String userId,
            @RequestBody UserProfileRequest request) {
        try {
            boolean success = userProfileService.updateUserProfile(request, userId);
            if (success) {
                return ResponseEntity.status(HttpStatus.OK).body(
                        ApiResponse.<String>builder()
                                .status(Integer.valueOf(ApiConstant.CODE_200))
                                .message("User profile updated successfully")
                                .data(userId)
                                .build());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ApiResponse.<String>builder()
                                .status(Integer.valueOf(ApiConstant.CODE_400))
                                .message("Failed to update user profile")
                                .build());
            }
        } catch (Exception e) {
            log.error("Error updating user profile for userId: {}", userId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.<String>builder()
                            .status(Integer.valueOf(ApiConstant.CODE_400))
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * Xóa profile người dùng
     */
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteProfile(@PathVariable String userId) {
        try {
            boolean success = userProfileService.deleteUserProfileByIdentityUserId(userId);
            if (success) {
                return ResponseEntity.status(HttpStatus.OK).body(
                        ApiResponse.<String>builder()
                                .status(Integer.valueOf(ApiConstant.CODE_200))
                                .message("User profile deleted successfully")
                                .data(userId)
                                .build());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ApiResponse.<String>builder()
                                .status(Integer.valueOf(ApiConstant.CODE_400))
                                .message("Failed to delete user profile")
                                .build());
            }
        } catch (Exception e) {
            log.error("Error deleting user profile for userId: {}", userId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.<String>builder()
                            .status(Integer.valueOf(ApiConstant.CODE_400))
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * Cập nhật địa chỉ của người dùng
     */
    @PutMapping("/update-address/{userId}")
    public ResponseEntity<ApiResponse<String>> updateAddress(@PathVariable String userId,
            @RequestBody AddressRequest addressRequest) {
        try {
            boolean success = userProfileService.updateAddress(addressRequest, userId);
            if (success) {
                return ResponseEntity.status(HttpStatus.OK).body(
                        ApiResponse.<String>builder()
                                .status(Integer.valueOf(ApiConstant.CODE_200))
                                .message("Address updated successfully")
                                .data(userId)
                                .build());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ApiResponse.<String>builder()
                                .status(Integer.valueOf(ApiConstant.CODE_400))
                                .message("Failed to update address")
                                .build());
            }
        } catch (Exception e) {
            log.error("Error updating address for userId: {}", userId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.<String>builder()
                            .status(Integer.valueOf(ApiConstant.CODE_400))
                            .message(e.getMessage())
                            .build());
        }
    }
}
