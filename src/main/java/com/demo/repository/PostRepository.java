package com.demo.repository;

import com.demo.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    // 제목에 특정 단어가 포함된 게시글을 찾는 메소드입니다
    Page<Post> findByTitleContaining(String search, Pageable pageable);
}