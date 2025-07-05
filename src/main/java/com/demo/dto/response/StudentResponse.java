package com.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class StudentResponse {
    private Long id;
    private String name;
    private Long studentNumber;
    private String phoneNumber;
    private String userId;
    private String password;
}