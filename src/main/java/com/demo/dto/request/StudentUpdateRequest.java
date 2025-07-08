package com.demo.dto.request;

import lombok.Getter;

@Getter
public class StudentUpdateRequest {
    private String name;
    private Long studentNumber;
    private String phoneNumber;
    private String loginId;
    private String password;
    private String email;
}
