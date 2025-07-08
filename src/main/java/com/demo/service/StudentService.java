package com.demo.service;

import com.demo.repository.StudentRepository;
import com.demo.domain.Student;
import com.demo.dto.request.StudentCreateRequest;
import com.demo.dto.response.StudentResponse;
import com.demo.dto.request.StudentUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StudentResponse create(StudentCreateRequest studentCreateRequest) {
        Student entity = Student.toEntity(studentCreateRequest);   //id 값이 없는 상태

        studentRepository.save(entity); //저장하면서 id값을 데이터베이스에서 생성해준다.

        return entity.toResponse();
    }

    @Transactional
    public StudentResponse encryptionPassword(StudentCreateRequest request) {
        String encoded = passwordEncoder.encode(request.getPassword());
        Student entity = Student.toEntity(request.withEncodedPassword(encoded));
        studentRepository.save(entity);
        return entity.toResponse();
    }

    @Transactional(readOnly = true)
    public StudentResponse findById(Long id) {
        return studentRepository.findById(id).orElse(null).toResponse();
    }

    @Transactional
    public StudentResponse update(Long id, StudentUpdateRequest studentUpdateRequest) {
        Student student = studentRepository.findById(id).get();
        student.update(studentUpdateRequest);  //객체가 수정될 것
        return student.toResponse();
    }

    @Transactional
    public void delete(Long id) {
        if(studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
        }
    }
}