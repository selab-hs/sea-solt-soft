package com.demo.service;

import com.demo.domain.Authority;
import com.demo.domain.Role;
import com.demo.exception.dto.ErrorMessage;
import com.demo.exception.student.NotFoundStudentException;
import com.demo.repository.AuthorityRepository;
import com.demo.repository.StudentRepository;
import com.demo.domain.Student;
import com.demo.dto.request.StudentCreateRequest;
import com.demo.dto.response.StudentResponse;
import com.demo.dto.request.StudentUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final AuthorityRepository authorityRepository;

    @Transactional
    public StudentResponse create(StudentCreateRequest studentCreateRequest) {
        Student entity = Student.toEntity(studentCreateRequest);
        log.info("Student information: {}", entity);

        assignRole(entity, Role.ROLE_USER);

        studentRepository.save(entity);

        return entity.toResponse();
    }

    public void assignRole(Student entity, Role role) {
        Authority authority = authorityRepository.findByRole(role)
                .orElseThrow(() -> new RuntimeException(role.name() + " 권한이 존재하지 않습니다."));
        entity.addAuthority(authority);
    }

    @Transactional(readOnly = true)
    public StudentResponse findById(String id) {
        return studentRepository.findByLoginId(id)
                .orElseThrow(() -> new NotFoundStudentException(
                        ErrorMessage.NOT_FOUND_STUDENT,
                        "요청한 사용자를 찾을 수 없습니다.")
                )
                .toResponse();
    }

    @Transactional
    public StudentResponse update(String id, StudentUpdateRequest studentUpdateRequest) {
        Student student = studentRepository.findByLoginId(id)
                .orElseThrow(() -> new NotFoundStudentException(
                        ErrorMessage.NOT_FOUND_STUDENT,
                        "요청한 사용자를 찾을 수 없습니다.")
                );

        student.update(studentUpdateRequest);  //객체가 수정될 것
        return student.toResponse();
    }

    @Transactional
    public void delete(String id) {
        if (studentRepository.existsByLoginId(id)) {
            studentRepository.deleteByLoginId(id);
        } else {
            throw new NotFoundStudentException(
                    ErrorMessage.NOT_FOUND_STUDENT,
                    "요청한 사용자를 찾을 수 없습니다."
            );
        }
    }
}