package com.demo.domain;

import com.demo.dto.request.PostUpdateRequest;
import com.demo.dto.response.PostResponse;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.time.ZoneOffset;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String content;
    private String description;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
        this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    // 게시글 수정 시 수정 시간 업데이트
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public void update(PostUpdateRequest request) {
        this.title = request.getTitle();
        this.content = request.getContent();
        this.description = request.getDescription();
    }

    public static Post createPost(String title, String content, String description, Student student) {
        Post post = new Post();
        post.title = title;
        post.content = content;
        post.description = description;
        post.student = student;
        return post;
    }

    public PostResponse toResponse() {
        return new PostResponse(
                this.id,
                this.title,
                this.content,
                this.description,
                this.createdAt != null ? this.createdAt.toString() : null,
                this.updatedAt != null ? this.updatedAt.toString() : null
        );
    }

    public Post(String title, String content, String description, Student student) {
        this.title = title;
        this.content = content;
        this.description = description;
        this.student = student;
    }
}