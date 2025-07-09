package com.demo.converter;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Converter(autoApply = true)
public class PasswordEncryptConverter implements AttributeConverter<String, String> {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return passwordEncoder.encode(attribute); //비번 암호화
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData; //암호화된 비번 반환
    }
}

