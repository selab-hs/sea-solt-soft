package com.demo.controller;

import com.demo.service.StudentService;
import com.demo.dto.request.StudentCreateRequest;
import com.demo.dto.request.StudentUpdateRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class ApiController {
    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody StudentCreateRequest request) {
        var response =  studentService.create(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable(name = "id") Long id) {
        var response = studentService.findById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> update(
            @RequestBody StudentUpdateRequest request,
            @PathVariable(name = "id") Long id
    ) {
        var response = studentService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable(name = "id") Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}