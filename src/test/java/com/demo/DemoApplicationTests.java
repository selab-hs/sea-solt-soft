package com.demo;

import com.demo.domain.Student;
import com.demo.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Transactional
class DemoApplicationTests {

    @Autowired
    private StudentRepository studentRepository;

    @Test
    void builderTest() {
    Student student = Student.builder();
        .nmae("송유찬");
        .build();

    Student savedStudent = studentRepository.save(student);
    assertTrue(savedStudent != null, "저장 성공함");
    }

}
