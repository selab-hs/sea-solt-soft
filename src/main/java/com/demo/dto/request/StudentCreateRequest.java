package com.demo.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
public class StudentCreateRequest {
    private String name;
    private Long studentNumber;
    private String phoneNumber;
    private String loginId;
    private String password;
    private String email;

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
