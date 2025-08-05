package com.demo.exception.post;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String 권한이_없습니다) {
        super("이 게시글에 대한 접근 권한이 없습니다.");
    }
}