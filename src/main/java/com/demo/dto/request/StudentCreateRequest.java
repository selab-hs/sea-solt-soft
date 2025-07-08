package com.demo.dto.request;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCreateRequest {
    private String name;
    private Long studentNumber;
    private String phoneNumber;
    private String loginId;
    private String password;
    private String email;

    public StudentCreateRequest withEncodedPassword(String encodedPassword) {
        return StudentCreateRequest.builder()
                .name(this.name)
                .studentNumber(this.studentNumber)
                .phoneNumber(this.phoneNumber)
                .loginId(this.loginId)
                .password(encodedPassword)
                .email(this.email)
                .build();
    }
}
