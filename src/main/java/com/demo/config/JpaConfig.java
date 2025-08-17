package com.demo.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA 설정을 설정하기 위한 Configuration
 *
 * <li>JPAQueryFactory: Querydsl을 사용하기 위해 JPAQueryFactory를 빈으로 등록</li>
 *
 * @author duskafka
 * */
@Slf4j
@EnableJpaAuditing
@Configuration
public class JpaConfig {

}