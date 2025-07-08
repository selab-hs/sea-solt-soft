package com.demo.controller;

import com.demo.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import com.demo.dto.request.StudentCreateRequest;

@RestController
@RequiredArgsConstructor
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
        public ResponseEntity<?> create(@RequestBody StudentCreateRequest request) {
        var response = studentService.encryptionPassword(request);
        return ResponseEntity.ok(response);
    }
}
