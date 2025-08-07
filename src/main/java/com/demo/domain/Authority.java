package com.demo.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * 사용자가 가지는 권한 엔티티
 *
 * <p>현재는 두 가지 권한만 존재한다.</p>
 * <li>ROLE_USER</li>
 * <li>ROLE_ADMIN</li>
 *
 * @author duskafka
 * */
@Entity
@Table(name = "authority")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Authority {

    @Id
    @Column(name = "authority_name", length = 50)
    @Enumerated(EnumType.STRING)  // Enum 값을 DB에 저장할 때 문자열로 저장하게 했습니다
    private Role role;

    public Authority(Role role) {
        this.role = role;
    }

    public static Authority createRole(Role role) {
        return new Authority(role);
    }

    public String getAuthorityName() {
        return role.name();  // Role enum 값을 문자열로 반환
    }
}