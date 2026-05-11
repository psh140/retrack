package com.retrack.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 서비스 메서드에 붙이면 ActivityLogAspect가 성공 실행 후 자동으로 활동 로그를 기록한다.
 * 인덱스는 메서드 파라미터의 0-based 위치를 사용한다.
 *
 * @since 2026-05-11
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogActivity {

    /** 기록할 행위 코드 (예: LOGIN, PROJECT_CREATE) */
    String action();

    /** 대상 타입 코드 (예: PROJECT, BUDGET, FILE); 없으면 빈 문자열 */
    String targetType() default "";

    /** userId로 사용할 파라미터 인덱스 (0-based); 반환값에서 추출하는 경우 -1 */
    int userIdParam() default -1;

    /** true이면 반환값 Map에서 "userId" 키로 userId를 추출 (login 전용) */
    boolean userIdFromReturn() default false;

    /** targetId로 사용할 파라미터 인덱스 (0-based); 반환값에서 추출하는 경우 -1 */
    int targetIdParam() default -1;

    /** true이면 Long 반환값을 targetId로 사용 (create 메서드 전용) */
    boolean targetIdFromReturn() default false;

    /**
     * description 문자열로 사용할 파라미터 인덱스 (0-based); -1이면 description 생략.
     * 추출한 값은 "→ {값}" 형태로 기록된다.
     */
    int descriptionParam() default -1;
}
