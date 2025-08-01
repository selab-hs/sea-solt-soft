package com.demo.controller.api;

import com.demo.service.StudentService;
import com.demo.dto.request.StudentCreateRequest;
import com.demo.dto.request.StudentUpdateRequest;

import jakarta.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentApiController {
    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<?> get(@AuthenticationPrincipal UserDetails authentication) {
        var response = studentService.findById(authentication.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> update(
            @RequestBody StudentUpdateRequest request,
            @AuthenticationPrincipal UserDetails authentication
    ) {
        var response = studentService.update(authentication.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@AuthenticationPrincipal UserDetails authentication) {
        studentService.delete(authentication.getUsername());
        return ResponseEntity.noContent().build();
    }
}