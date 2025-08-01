package com.demo.domain.vo;

import lombok.Getter;

import java.util.regex.Pattern;

/**
 * Programmer 엔티티에서 password가 유효한 형식인지 검사하고 저장하기 위한 VO
 *
 * <li>최소 8글자, 글자 1개, 숫자 1개, 특수문자 1개</li>
 *
 * @author duskafka
 * */
@Getter
public class Password {
    private String password;

    public Password(String password) {
        validatePassword(password);
    }

    private void validatePassword(String password) {
        this.password = password;
    }

    public void setEncodePassword(String encodePassword) {
        this.password = encodePassword;
    }
}