package com.demo.dto.response;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class PostResponse {

    private Long id;             // 게시글 ID
    private String title;        // 게시글 제목
    private String content;      // 게시글 내용
    private String description;  // 게시글 설명
    private String createdAt;    // 게시글 작성 시간
    private String updatedAt;    // 게시글 수정 시간

}