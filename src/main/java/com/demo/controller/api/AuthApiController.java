package com.demo.controller.api;

import com.demo.config.properties.JWTProperties;
import com.demo.dto.request.LoginRequest;
import com.demo.dto.request.StudentCreateRequest;
import com.demo.jwt.TokenProvider;
//import com.demo.repository.StudentRepository;
import com.demo.dto.response.PostWithUserNameResponse;
import com.demo.service.StudentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

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


    @GetMapping("/check-id")
    public ResponseEntity<?> checkId(@RequestParam String loginId){
        if(studentService.ixExistLoginId(loginId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok().build();
    }
}