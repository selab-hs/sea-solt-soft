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

    @Column(name = "student_age", nullable = true, length = 3)
    private Long age;

    @Builder(access = AccessLevel.PRIVATE)
    public Student(String name, Long age) {
        this.name = name;
        this.age = age;
    }

    public static Student toEntity(StudentCreateRequest request){
        return Student.builder()
                .name(request.getName())
                .age(request.getAge())
                .build();
    }

    public void update(StudentUpdateRequest request){
        this.name = request.getName();
        this.age = request.getAge();
    }

    public StudentResponse toResponse(){
        return StudentResponse.builder()
                .id(this.id)
                .name(this.name)
                .age(this.age)
                .build();
    }
}