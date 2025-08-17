package com.demo.service;

import com.demo.domain.Role;
import com.demo.domain.Student;
import com.demo.domain.Post;
import com.demo.dto.request.PostCreateRequest;
import com.demo.dto.request.PostUpdateRequest;
import com.demo.dto.response.PostResponse;
import com.demo.dto.response.PostWithUserNameResponse;
import com.demo.exception.student.NotFoundStudentException;
import com.demo.exception.post.PostNotFoundException;
import com.demo.exception.post.UnauthorizedAccessException;
import com.demo.repository.PostRepository;
import com.demo.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final StudentRepository studentRepository;

    //  상세 조회는 작성자 이름이 포함된 DTO로 반환
    @Transactional(readOnly = true)
    public PostWithUserNameResponse getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다"));

        return PostWithUserNameResponse.toResponse(post);
    }

    @Transactional(readOnly = true)
    public Page<PostWithUserNameResponse> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable).map(PostWithUserNameResponse::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostWithUserNameResponse> searchPosts(String search, Pageable pageable) {
        return postRepository.findByTitleContaining(search, pageable)
                .map(PostWithUserNameResponse::toResponse);
    }

    @Transactional
    public PostResponse createPost(PostCreateRequest request, String studentId) {
        Student student = studentRepository.findByLoginId(studentId)
                .orElseThrow(() -> new NotFoundStudentException("학생을 찾을 수 없습니다"));

        Post post = new Post(request.getTitle(), request.getContent(), request.getDescription(), student);
        postRepository.save(post);

        return post.toResponse();
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest request, String studentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다"));

        Student student = studentRepository.findByLoginId(studentId)
                .orElseThrow(() -> new NotFoundStudentException("학생을 찾을 수 없습니다"));

        if (!post.getStudent().getLoginId().equals(studentId) && !student.hasRole(Role.ROLE_ADMIN)) {
            throw new UnauthorizedAccessException("권한이 없습니다");
        }

        post.update(request);
        return post.toResponse();
    }

    @Transactional
    public void deletePost(Long postId, String studentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다"));

        Student student = studentRepository.findByLoginId(studentId)
                .orElseThrow(() -> new NotFoundStudentException("학생을 찾을 수 없습니다"));

        if (!post.getStudent().getLoginId().equals(studentId) && !student.hasRole(Role.ROLE_ADMIN)) {
            throw new UnauthorizedAccessException("권한이 없습니다");
        }

        postRepository.delete(post);
    }
}
