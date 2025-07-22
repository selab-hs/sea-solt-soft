package com.demo.domain;

import com.demo.domain.converter.PasswordEncodeConverter;
import com.demo.dto.request.StudentCreateRequest;
import com.demo.dto.response.StudentResponse;
import com.demo.dto.request.StudentUpdateRequest;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
@Getter
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Long id;

    @Column(name = "student_name", length = 50)
    private String name;

    @Column(name = "student_number", length = 10)
    private Long studentNumber;

    @Column(name = "student_phone", length = 11)
    private String phoneNumber;

    @Column(name = "user_id", length = 25)
    private String loginId;

    @Column(name = "user_password", nullable = false)
    @Convert(converter = PasswordEncodeConverter.class)
    private String password;

    @Column(name = "user_email", length = 50)
    private String email;

    @ManyToMany
    @JoinTable(
            name = "student_authority",
            joinColumns = {@JoinColumn(name = "student_id", referencedColumnName = "student_id")},
            inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "authority_name")}
    )
    private Set<Authority> authorities = new HashSet<>();

    @Builder(access = AccessLevel.PRIVATE)
    public Student(String name, Long studentNumber, String phoneNumber, String loginId, String password, String email) {
        this.name = name;
        this.studentNumber = studentNumber;
        this.phoneNumber = phoneNumber;
        this.loginId = loginId;
        this.password = password;
        this.email = email;
    }

    public static Student toEntity(StudentCreateRequest request) {
        return Student.builder()
                .name(request.getName())
                .studentNumber(request.getStudentNumber())
                .phoneNumber(request.getPhoneNumber())
                .loginId(request.getUserId())
                .password(request.getPassword())
                .email(request.getEmail())
                .build();
    }

    public void update(StudentUpdateRequest request) {
        this.name = request.getName();
        this.studentNumber = request.getStudentNumber();
        this.phoneNumber = request.getPhoneNumber();
        this.loginId = request.getUserId();
        this.password = request.getPassword();
        this.email = request.getEmail();
    }

    public StudentResponse toResponse() {
        return StudentResponse.builder()
                .id(this.id)
                .name(this.name)
                .studentNumber(this.studentNumber)
                .phoneNumber(this.phoneNumber)
                .userId(this.loginId)
                .password(this.password)
                .build();
    }

    public void addAuthority(Authority authority) {
        this.authorities.add(authority);
    }
}