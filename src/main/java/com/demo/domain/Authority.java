package com.demo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private String authorityName;

    public  Authority(String authorityName) {
        this.authorityName = authorityName;
    }

    public static Authority createRole(String roleName) {
        return new Authority(roleName);
    }
}