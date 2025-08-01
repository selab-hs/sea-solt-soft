package com.demo.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCreateRequest {

    private String title;
    private String content;
    private String description;
    private String studentId;
}