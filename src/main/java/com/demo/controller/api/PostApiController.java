package com.demo.controller.api;

import com.demo.dto.request.PostCreateRequest;
import com.demo.dto.request.PostUpdateRequest;
import com.demo.dto.response.PostResponse;
import com.demo.domain.Post;
import com.demo.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
        return postService.getPost(postId);
    }

    @PutMapping("/{postId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public PostResponse updatePost(@PathVariable Long postId, @RequestBody PostUpdateRequest request, @RequestParam String studentId) {
        return postService.updatePost(postId, request, studentId);
    }

    @DeleteMapping("/{postId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public void deletePost(@PathVariable Long postId, @RequestParam String studentId) {
        postService.deletePost(postId, studentId);
    }

    @GetMapping
    public Page<PostResponse> getPostList(@RequestParam(required = false) String titleSearch,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);  // 페이지 정보 설정

        Page<PostResponse> postResponsePagePage = (titleSearch == null)
                ? postService.getAllPosts(pageable)
                : postService.searchPosts(titleSearch, pageable);

        return postResponsePagePage;
    }
}