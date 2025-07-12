package com.demo.converter;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


@Converter(autoApply = true)
public class PasswordEncryptConverter implements AttributeConverter<String, String> {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        return passwordEncoder.encode(attribute); //비번 암호화
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData; //암호화된 비번 반환
    }
}

