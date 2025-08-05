package com.demo.exception.post;

public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(String Post_Not_Found) {
        super("게시글을 찾을 수 없습니다");
    }
}