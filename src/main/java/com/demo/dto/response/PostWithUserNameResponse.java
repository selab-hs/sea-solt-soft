package com.demo.dto.response;

import com.demo.domain.Post;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostWithUserNameResponse {
    private Long id;             // 게시글 ID
    private String title;        // 게시글 제목
    private String content;      // 게시글 내용
    private String description;  // 게시글 설명
    private String createdAt;    // 게시글 작성 시간
    private String updatedAt;    // 게시글 수정 시간
    private String username;

    public static PostWithUserNameResponse toResponse(Post post) {
        return PostWithUserNameResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .description(post.getDescription())
                .createdAt(post.getCreatedAt().toString())
                .updatedAt(post.getUpdatedAt().toString())
                .username(post.getStudent().getName())
                .build();
    }
}