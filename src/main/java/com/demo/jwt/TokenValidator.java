package com.demo.jwt;

import com.demo.config.properties.JWTProperties;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.Key;

/**
 * 토큰의 유효성을 검증하기 위한 클래스
 *
 * @author duskafka
 * */
@Slf4j
@Service
public class TokenValidator {
    private final Key KEY;

    public TokenValidator(JWTProperties jwtProperties) {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.secret());    // Secret 값을 Base64 디코딩하여 HMAC SHA 키로 변환합니다.
        this.KEY = Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean validateToken(String token) {
        try {
            log.debug("[TokenProvider] validateToken({})", token);
            Jwts.parserBuilder().setSigningKey(KEY).build().parseClaimsJws(token); // 토큰 파싱 및 검증
            log.info("[TokenProvider] Token validation successful.");
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.warn("[TokenProvider] Invalid JWT signature or malformed JWT token. Token: {}, Error: {}", token, e.getMessage());
            return false;
        } catch (ExpiredJwtException e) {
            log.warn("[TokenProvider] Expired JWT token. Token: {}, Error: {}", token, e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.warn("[TokenProvider] Unsupported JWT token. Token: {}, Error: {}", token, e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.warn("[TokenProvider] JWT token is illegal or invalid argument. Token: {}, Error: {}", token, e.getMessage());
            return false;
        }
    }
}