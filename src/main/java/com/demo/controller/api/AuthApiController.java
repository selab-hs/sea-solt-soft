package com.demo.controller.api;

import com.demo.config.properties.JWTProperties;
import com.demo.dto.request.LoginRequest;
import com.demo.dto.request.StudentCreateRequest;
import com.demo.jwt.TokenProvider;
import com.demo.service.StudentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthApiController {
    private final TokenProvider tokenProvider;
    private final JWTProperties jwtProperties;
    private final StudentService studentService;
    private final AuthenticationManager authenticationManager;

    @PostMapping(value = "/login")
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

    @PostMapping(value = "/register")
    public ResponseEntity<?> register(@RequestBody StudentCreateRequest studentCreateRequest) {
        var response = studentService.create(studentCreateRequest);
        return ResponseEntity.ok(response);
    }
}