package com.demo.exception.post;

public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(String PostNotFound) {
        super("게시글을 찾을 수 없습니다");
    }
}