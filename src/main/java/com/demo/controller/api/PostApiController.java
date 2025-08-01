package com.demo.controller.api;

import com.demo.dto.request.PostCreateRequest;
import com.demo.dto.request.PostUpdateRequest;
import com.demo.dto.response.PostResponse;
import com.demo.domain.Post;
import com.demo.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/posts")
public class PostApiController {

    private final PostService postService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public PostResponse createPost(@RequestBody PostCreateRequest request, @RequestParam String studentId) {
        return postService.createPost(request, studentId);
    }

    @GetMapping("/{postId}")
    public PostResponse getPost(@PathVariable Long postId) {
        return postService.getPost(postId).toResponse();
    }

    @PutMapping("/{postId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public PostResponse updatePost(@PathVariable Long postId, @RequestBody PostUpdateRequest request, @RequestParam String studentId) {
        return postService.updatePost(postId, request, studentId);
    }

    @DeleteMapping("/{postId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void deletePost(@PathVariable Long postId, @RequestParam String studentId) {
        postService.deletePost(postId, studentId);
    }

    @GetMapping
    public List<PostResponse> getPostList(@RequestParam(required = false) String search,
                                          @RequestParam int page,
                                          @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);  // 페이지 정보 설정
        List<Post> posts = (search == null) ? postService.getAllPosts(pageable).getContent() :
                postService.searchPosts(search, pageable).getContent();  // 검색어가 없으면 전체 게시글 조회, 있으면 검색된 게시글 조회
        return posts.stream().map(Post::toResponse).collect(Collectors.toList());  // 게시글을 PostResponse로 변환하여 반환
    }

    private boolean isAdmin(String studentId) {
        return postService.isAdmin(studentId);
    }
}