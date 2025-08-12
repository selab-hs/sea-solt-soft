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

    public static PostResponse fromPost(com.demo.domain.Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getDescription(),
                post.getCreatedAt() != null ? post.getCreatedAt().toString() : null,
                post.getUpdatedAt() != null ? post.getUpdatedAt().toString() : null
        );
    }
}