package com.demo.controller.ui;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AuthUIController {

    @RequestMapping("/sign-in")
    public String signIn() {

        return "/login/login-1.0";
    }

    @RequestMapping("/sign-up")
    public String signUp() {
        return "/signup/signup-1.0";
    }
}
