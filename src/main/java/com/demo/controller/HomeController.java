package com.demo.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/")
public class HomeController {

    @RequestMapping
    public String home() {
        return "home";
    }

    @RequestMapping("/login")
    public String login() {
        return "profile/login";
    }
}