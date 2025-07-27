package com.demo.controller.api;

import com.demo.config.properties.JWTProperties;
import com.demo.dto.request.LoginRequest;
import com.demo.dto.request.StudentCreateRequest;
import com.demo.jwt.TokenProvider;
//import com.demo.repository.StudentRepository;
import com.demo.service.StudentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthApiController {

    private final TokenProvider tokenProvider;
    private final JWTProperties jwtProperties;
    private final StudentService studentService;
    private final AuthenticationManager authenticationManager;
    //private final StudentRepository studentRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest,
            HttpServletResponse response
    ) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getLoginId(), loginRequest.getPassword())
        );

        log.info(authentication.toString());

        String accessToken = tokenProvider.createAccessToken(authentication);
        response.addHeader(jwtProperties.accessTokenHeader(), jwtProperties.bearerHeader() + accessToken);

        return ResponseEntity.ok().build();
    }

    //@PostMapping("/register")
    @PostMapping(value = "/register")
    public ResponseEntity<?> register(@RequestBody StudentCreateRequest studentCreateRequest) {
        var response = studentService.create(studentCreateRequest);
        return ResponseEntity.ok(response);
    }

    /* 아이디 중복 확인 API 만들어봤는데 한번확인해주시면 감사하겠습니다.
    @GetMapping("/check-id")
    public ResponseEntity<?> checkLoginId(@RequestParam String userId) {
        boolean exists = studentRepository.existsByLoginId(userId);

        Map<String, Boolean> result = new HashMap<>();
        result.put("available", !exists); // true = 사용 가능

        return ResponseEntity.ok(result);
    }*/
}
