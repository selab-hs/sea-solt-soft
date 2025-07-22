---
name: Feature request
about: 기능 리포트 템플릿
title: ''
labels: ''
assignees: ''

---

## **예시** ##

## ✨ 구현된 기능

- 사용자 프로필 페이지에서 기본 정보 수정 기능을 구현했습니다.

## 📝 구현 내용

- 사용자가 프로필 페이지에서 자신의 이름, 이메일, 비밀번호를 수정할 수 있는 기능을 추가했습니다.
    1. 사용자 정보를 가져오는 API 작성
    2. 정보 수정 폼에 기본값을 채우고, 수정된 값을 서버로 전송하는 로직
    3. 비밀번호는 암호화 처리 후 저장되도록 구현

## ⚙️ 기술적 구현 세부 사항

- 사용한 기술 스택: Spring Boot, Thymeleaf, BCryptPasswordEncoder
- 외부 라이브러리: Spring Security, Thymeleaf, Lombok
- 비밀번호는 BCryptPasswordEncoder를 사용하여 암호화 처리

## 💬 코드 예시

```java
public String updateProfile(@RequestParam String name, @RequestParam String email, @RequestParam String password) {
    if (!password.isEmpty()) {
        password = passwordEncoder.encode(password); // 비밀번호 암호화
    }
    // 사용자 정보 업데이트 로직
    return "redirect:/profile"; // 프로필 페이지로 리디렉션
}
