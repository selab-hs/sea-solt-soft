package com.demo.domain;

import com.demo.dto.request.StudentCreateRequest;
import com.demo.dto.response.StudentResponse;
import com.demo.dto.request.StudentUpdateRequest;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Long id;

    @Column(name = "student_name", nullable = true, length = 50)
    private String name;

    @Column(name = "student_number", nullable = true, length = 10)
    private Long studentNumber;

    @Column(name = "student_phone", nullable = true, length = 11)
    private String phoneNumber;

    @Column(name = "user_id", nullable = true, length = 25)
    private String userId;

    @Column(name = "user_password", nullable = false, length = 50)
    private String password;

    @Column(name = "user_email", nullable = true, length = 50)
    private String email;

    @Builder(access = AccessLevel.PRIVATE)
    public Student(String name, Long studentNumber, String phoneNumber, String userId, String password, String email) {
        this.name = name;
        this.studentNumber = studentNumber;
        this.phoneNumber = phoneNumber;
        this.userId = userId;
        this.password = password;
        this.email = email;
    }

    public static Student toEntity(StudentCreateRequest request){
        return Student.builder()
                .name(request.getName())
                .studentNumber(request.getStudentNumber())
                .phoneNumber(request.getPhoneNumber())
                .userId(request.getUserId())
                .password(request.getPassword())
                .email(request.getEmail())
                .build();
    }

    public void update(StudentUpdateRequest request){
        this.name = request.getName();
        this.studentNumber = request.getStudentNumber();
        this.phoneNumber = request.getPhoneNumber();
        this.userId = request.getUserId();
        this.password = request.getPassword();
        this.email = request.getEmail();
    }

    public StudentResponse toResponse(){
        return StudentResponse.builder()
                .id(this.id)
                .name(this.name)
                .studentNumber(this.studentNumber)
                .phoneNumber(this.phoneNumber)
                .userId(this.userId)
                .password(this.password)
                .build();
    }
}