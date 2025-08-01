package com.demo.service;

import com.demo.domain.Student;
import com.demo.domain.Post;
import com.demo.dto.request.PostCreateRequest;
import com.demo.dto.request.PostUpdateRequest;
import com.demo.dto.response.PostResponse;
import com.demo.exception.student.NotFoundStudentException;
import com.demo.exception.post.PostNotFoundException;
import com.demo.exception.post.UnauthorizedAccessException;
import com.demo.repository.PostRepository;
import com.demo.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final StudentRepository studentRepository;

    public Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다"));
    }

    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    public Page<Post> searchPosts(String search, Pageable pageable) {
        return postRepository.findByTitleContaining(search, pageable);
    }

    public PostResponse createPost(PostCreateRequest request, String studentId) {
        Student student = studentRepository.findByLoginId(studentId)
                .orElseThrow(() -> new NotFoundStudentException("학생을 찾을 수 없습니다"));

        Post post = new Post(request.getTitle(), request.getContent(), request.getDescription(), student);
        postRepository.save(post);

        return post.toResponse();
    }

    public PostResponse updatePost(Long postId, PostUpdateRequest request, String studentId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다"));
        if (!post.getStudent().getLoginId().equals(studentId) && !isAdmin(studentId)) {
            throw new UnauthorizedAccessException();
        }
        post.update(request);
        return post.toResponse();
    }

    public void deletePost(Long postId, String studentId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다"));
        if (!post.getStudent().getLoginId().equals(studentId) && !isAdmin(studentId)) {
            throw new UnauthorizedAccessException();
        }
        postRepository.delete(post);
    }

    public boolean isAdmin(String studentId) {
        Student student = studentRepository.findByLoginId(studentId)
                .orElseThrow(() -> new NotFoundStudentException("학생을 찾을 수 없습니다."));

        return student.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthorityName().equals("ROLE_ADMIN"));
    }
}