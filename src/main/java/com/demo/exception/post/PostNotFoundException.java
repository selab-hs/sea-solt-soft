package com.demo.exception.post;

public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(String 게시글을_찾을_수_없습니다) {
        super("게시글을 찾을 수 없습니다.");
    }
}