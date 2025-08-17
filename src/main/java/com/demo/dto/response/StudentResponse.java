package com.demo.dto.response;

import com.demo.domain.Student;
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

    public static StudentResponse fromStudent(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .name(student.getName())
                .studentNumber(student.getStudentNumber())
                .phoneNumber(student.getPhoneNumber())
                .userId(student.getLoginId())
                .password(null)
                .build();
    }
}