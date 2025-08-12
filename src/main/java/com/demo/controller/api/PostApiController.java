package com.demo.controller.api;

import com.demo.domain.Student;
import com.demo.dto.request.PostCreateRequest;
import com.demo.dto.request.PostUpdateRequest;
import com.demo.dto.response.PostResponse;
import com.demo.domain.Post;
import com.demo.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/posts")
public class PostApiController {

    private final PostService postService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public PostResponse createPost(@RequestBody PostCreateRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        String studentId = userDetails.getUsername();
        log.info("Creating post: Student ID: {}, Post Title: {}", studentId, request.getTitle());
        PostResponse response = postService.createPost(request, studentId);
        log.info("Post created successfully: Post ID: {}", response.getId());
        return response;
    }

    @GetMapping("/{postId}")
    public PostResponse getPost(@PathVariable Long postId) {
        log.info("Fetching post with ID: {}", postId);
        PostResponse response = postService.getPost(postId);
        log.info("Post fetched successfully: Post ID: {}", postId);
        return response;
    }

    @PutMapping("/{postId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public PostResponse updatePost(@PathVariable Long postId, @RequestBody PostUpdateRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        String studentId = userDetails.getUsername();
        log.info("Updating post: Post ID: {}, Student ID: {}, New Title: {} ", postId, studentId,  request.getTitle());
        PostResponse response = postService.updatePost(postId, request, studentId);
        log.info("Post updated successfully: Post ID: {}", postId);
        return response;
    }

    @DeleteMapping("/{postId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public void deletePost(@PathVariable Long postId, @AuthenticationPrincipal UserDetails userDetails) {
        String studentId = userDetails.getUsername();
        log.info("Deleting post: Post ID: {}, Student ID: {}", postId, studentId);
        postService.deletePost(postId, studentId);
        log.info("Post deleted successfully: Post ID: {}, ", postId);
    }

    @GetMapping
    public Page<PostResponse> getPostList(@RequestParam(required = false) String titleSearch,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);  // 페이지 정보 설정
        log.info("Fetching post list: Search Query: {}, Page: {}, Size: {}", titleSearch, page, size);

        Page<PostResponse> postPage = (titleSearch == null)
                ? postService.getAllPosts(pageable)
                : postService.searchPosts(titleSearch, pageable);

        log.info("Fetched {} posts.", postPage.getTotalElements());
        return postPage;
    }
}