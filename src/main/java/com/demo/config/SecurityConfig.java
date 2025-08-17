package com.demo.config;

import com.demo.config.properties.JWTProperties;
import com.demo.jwt.JwtAccessDeniedHandler;
import com.demo.jwt.JwtAuthenticationEntryPoint;
import com.demo.jwt.TokenProvider;
import com.demo.jwt.TokenValidator;
import com.demo.repository.StudentRepository;
import com.demo.service.CustomLoginService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.cors.CorsUtils;

@Slf4j
@EnableWebSecurity
@EnableMethodSecurity
@Configuration
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class SecurityConfig {
    private final CorsFilter corsFilter;
    private final TokenProvider tokenProvider;
    private final TokenValidator tokenValidator;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final JWTProperties jwtProperties;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CustomLoginService customLoginService(StudentRepository studentRepository) {
        return new CustomLoginService(studentRepository);
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, PasswordEncoder passwordEncoder, CustomLoginService customLoginService) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(customLoginService)
                .passwordEncoder(passwordEncoder)
                .and()
                .build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> {
                    exception.accessDeniedHandler(jwtAccessDeniedHandler)
                            .authenticationEntryPoint(jwtAuthenticationEntryPoint);
                })
                .authorizeHttpRequests(request -> {
                    request
                            // UI 라우트: 비로그인 허용
                            .requestMatchers("/", "/sign-in", "/sign-up").permitAll()
                            .requestMatchers("/posts", "/posts/*", "/posts/edit/*").permitAll()
                            .requestMatchers("/js/**", "/css/**", "/images/**", "/favicon.ico", "/error").permitAll()

                            //  API 조회는 비로그인 허용
                            .requestMatchers(HttpMethod.GET, "/api/v1/posts/**").permitAll()

                            //  API 쓰기 작업은 인증 필요
                            .requestMatchers(HttpMethod.POST,   "/api/v1/posts/**").authenticated()
                            .requestMatchers(HttpMethod.PUT,    "/api/v1/posts/**").authenticated()
                            .requestMatchers(HttpMethod.DELETE, "/api/v1/posts/**").authenticated()

                            // 나머지 기존 정책
                            .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/check-id").permitAll()
                            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                            .requestMatchers("/api/v1/students/**").hasAnyRole("ADMIN", "USER")
                            .requestMatchers(org.springframework.web.cors.CorsUtils::isPreFlightRequest).permitAll()
                            .anyRequest().authenticated();
                })
                .sessionManagement(session -> {
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                })
                .headers(headers -> {
                    headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin);
                })
                .with(new JwtSecurityConfig(tokenProvider, tokenValidator, jwtProperties), customizer -> {
                });
        return http.build();
    }
}