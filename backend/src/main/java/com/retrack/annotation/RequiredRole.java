package com.retrack.annotation;

import java.lang.annotation.*;

/**
 * 해당 API에 접근하기 위한 최소 권한을 지정하는 어노테이션
 *
 * 권한 계층: VIEWER < RESEARCHER < MANAGER < ADMIN
 *
 * 사용 예:
 * @RequiredRole("RESEARCHER")  → RESEARCHER, MANAGER, ADMIN 접근 가능
 * @RequiredRole("ADMIN")       → ADMIN만 접근 가능
 *
 * 어노테이션이 없는 API는 로그인만 되어 있으면 누구나 접근 가능 (ALL)
 *
 * @since 2026-04-17
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiredRole {
    String value();
}
