package com.tam.identity.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${app.prefix}/manager/auth")
@RequiredArgsConstructor
public class ManagerAuthController {
}
