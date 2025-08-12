package com.demo.jwt;

import com.demo.config.properties.JWTProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 토큰 발급을 위한 서비스
 *
 * @author duskafka
 * */
@Slf4j
@Component
public class TokenProvider {
    private final String AUTHORITIES_KEY;           // JWT 클레임에서 권한 정보를 추출할 때 사용하는 키
    private final Key KEY;                          // JWT 서명에 사용되는 Secret Key

    private final long ACCESS_TOKEN_VALIDATE_HOUR;     // 토큰의 유효 시간 (시간 단위)

    public TokenProvider(
            JWTProperties jwtProperties
    ) {
        this.AUTHORITIES_KEY = jwtProperties.authorityKey();
        this.ACCESS_TOKEN_VALIDATE_HOUR = Duration.ofHours(jwtProperties.accessTokenValidityInHour()).toMillis();
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.secret());    // Secret 값을 Base64 디코딩하여 HMAC SHA 키로 변환합니다.
        this.KEY = Keys.hmacShaKeyFor(keyBytes);
    }


    public String createAccessToken(Authentication authentication) {
        Claims claims = Jwts.claims().setSubject(authentication.getName());

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        claims.put(AUTHORITIES_KEY, roles);

        Date now = new Date();
        Date expiry = new Date(now.getTime() + ACCESS_TOKEN_VALIDATE_HOUR);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS256, KEY)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        try {
            Claims claims = Jwts
                    .parserBuilder()
                    .setSigningKey(KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // 클레임에서 권한 정보 추출 및 GrantedAuthority 객체로 변환
            Collection<? extends GrantedAuthority> authorities = extractAuthorities(claims);

            User principal = new User(claims.getSubject(), "", authorities);

            return new UsernamePasswordAuthenticationToken(principal, token, authorities);

        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid JWT token", e);
        }
    }

    private Collection<? extends GrantedAuthority> extractAuthorities(Claims claims) {
        Object authoritiesObj = claims.get(AUTHORITIES_KEY);

        if (authoritiesObj == null) {
            return Collections.emptyList();
        }

        if (authoritiesObj instanceof List) {
            return ((List<?>) authoritiesObj).stream()
                    .map(Object::toString)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        }

        String authoritiesStr = authoritiesObj.toString();

        // 대괄호 제거 (예: "[ROLE_USER]" -> "ROLE_USER")
        authoritiesStr = authoritiesStr.replaceAll("^\\[|\\]$", "");

        if (authoritiesStr.trim().isEmpty()) {
            return Collections.emptyList();
        }

        return Arrays.stream(authoritiesStr.split(","))
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}