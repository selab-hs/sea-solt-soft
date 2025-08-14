package com.demo.controller.ui;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PostUIController {

    // 게시글 목록 페이지

    @RequestMapping("/posts")
    public String postList() {
        return "/post/post-list";
    }


    @RequestMapping("/posts/new")
    public String postCreate() {
        return "/post/post-create";
    }

    @RequestMapping("/posts/{id}/edit")
    public String postEdit(@PathVariable Long id) {
        // id를 수정 페이지에 전달하고 싶으면 Model에 담아서 넘길 수도 있음
        return "/post/post-update";
    }

    @RequestMapping("/posts/{id}")
    public String postDetails(@PathVariable Long id) {
        return "/post/post-details";
    }
}
