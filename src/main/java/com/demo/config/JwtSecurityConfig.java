package com.demo.config;

import com.demo.config.properties.JWTProperties;
import com.demo.jwt.JwtFilter;
import com.demo.jwt.TokenProvider;
import com.demo.jwt.TokenValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class JwtSecurityConfig  extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {
    private final TokenProvider tokenProvider;
    private final TokenValidator tokenValidator;
    private final JWTProperties jwtProperties;

    @Override
    public void configure(HttpSecurity http) {
        http.addFilterBefore(
                new JwtFilter(tokenProvider, tokenValidator, jwtProperties),
                UsernamePasswordAuthenticationFilter.class
        );
    }
}
