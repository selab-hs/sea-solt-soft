package com.demo.exception.post;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String nonePermission) {
        super("이 게시글에 대한 접근 권한이 없습니다.");
    }
}