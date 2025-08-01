package com.demo.dto.request;

import lombok.Data;

@Data
public class LoginRequest {
    String loginId;
    String password;
}