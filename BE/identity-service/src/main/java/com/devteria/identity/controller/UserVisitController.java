package com.devteria.identity.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.devteria.identity.dto.request.ApiResponse;
import com.devteria.identity.entity.UserVisit;
import com.devteria.identity.service.UserVisitService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/visits")
@RequiredArgsConstructor
public class UserVisitController {
    private final UserVisitService userVisitService;

    @GetMapping
    public ApiResponse<List<UserVisit>> getAllVisits() {
        return ApiResponse.<List<UserVisit>>builder()
                .result(userVisitService.getAllVisits())
                .build();
    }
}
