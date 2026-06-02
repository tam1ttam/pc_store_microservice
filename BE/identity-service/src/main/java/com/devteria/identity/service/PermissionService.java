package com.devteria.identity.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.devteria.identity.dto.request.PermissionRequest;
import com.devteria.identity.dto.response.PermissionResponse;
import com.devteria.identity.entity.Permission;
import com.devteria.identity.exception.AppException;
import com.devteria.identity.exception.ErrorCode;
import com.devteria.identity.mapper.PermissionMapper;
import com.devteria.identity.repository.PermissionRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {

    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    public PermissionResponse create(PermissionRequest request) {
        if (permissionRepository.existsByName(request.getName())) throw new AppException(ErrorCode.PERMISSION_EXISTED);
        Permission permission = permissionMapper.toPermission(request);
        permission = permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll().stream()
                .map(permissionMapper::toPermissionResponse)
                .toList();
    }

    /** Xoá theo name (thân thiện hơn ID số) */
    public void delete(String name) {
        Permission perm = permissionRepository
                .findByName(name)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_EXISTED));
        permissionRepository.deleteById(perm.getId());
    }
}
