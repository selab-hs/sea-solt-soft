package com.demo.exception.student;

import com.demo.exception.BusinessException;
import com.demo.exception.dto.ErrorMessage;

public class NotFoundStudentException extends BusinessException {
    public NotFoundStudentException(ErrorMessage message) {
        super(message);
    }

    public NotFoundStudentException(ErrorMessage message, String reason) {
        super(message, reason);
    }

    public NotFoundStudentException(String reason) {
        super(reason);
    }
}