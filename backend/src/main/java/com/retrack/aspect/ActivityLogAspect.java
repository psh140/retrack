package com.retrack.aspect;

import com.retrack.annotation.LogActivity;
import com.retrack.mapper.ActivityLogMapper;
import com.retrack.vo.ActivityLogVO;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * @LogActivity 어노테이션이 붙은 서비스 메서드의 성공 실행 후 활동 로그를 자동 기록하는 어드바이스.
 *
 * 실행 순서: ActivityLogAspect(Order=1) → @Transactional 프록시 → 실제 메서드
 * 즉, @Transactional 트랜잭션이 커밋된 후 로그를 삽입하므로 핵심 트랜잭션과 분리된다.
 * 메서드가 예외를 던지면 pjp.proceed()에서 예외가 그대로 전파되어 로그 삽입 코드에 진입하지 않는다.
 *
 * @since 2026-05-11
 */
@Aspect
@Component
@Order(1)
public class ActivityLogAspect {

    private final ActivityLogMapper activityLogMapper;

    public ActivityLogAspect(ActivityLogMapper activityLogMapper) {
        this.activityLogMapper = activityLogMapper;
    }

    /**
     * @LogActivity 어노테이션이 붙은 메서드의 주변 어드바이스.
     * 메서드가 정상 반환된 후 활동 로그를 삽입하며, 삽입 실패는 무시한다.
     */
    @Around("@annotation(logActivity)")
    public Object logActivity(ProceedingJoinPoint pjp, LogActivity logActivity) throws Throwable {
        Object result = pjp.proceed();

        try {
            Object[] args = pjp.getArgs();

            Long userId = extractUserId(args, result, logActivity);
            if (userId == null) return result;

            Long targetId = extractTargetId(args, result, logActivity);

            String description = null;
            int descIdx = logActivity.descriptionParam();
            if (descIdx >= 0 && descIdx < args.length && args[descIdx] != null) {
                description = "→ " + args[descIdx];
            }

            ActivityLogVO log = new ActivityLogVO();
            log.setUserId(userId);
            log.setAction(logActivity.action());
            if (!logActivity.targetType().isEmpty()) log.setTargetType(logActivity.targetType());
            log.setTargetId(targetId);
            log.setDescription(description);
            activityLogMapper.insert(log);

        } catch (Exception e) {
            // 로그 실패가 핵심 로직에 영향 주지 않도록 무시
        }

        return result;
    }

    /** userId 파라미터 또는 반환값 Map에서 userId를 추출 */
    private Long extractUserId(Object[] args, Object result, LogActivity logActivity) {
        if (logActivity.userIdFromReturn()) {
            if (result instanceof Map) {
                Object uid = ((Map<?, ?>) result).get("userId");
                if (uid instanceof Long) return (Long) uid;
            }
            return null;
        }
        int idx = logActivity.userIdParam();
        if (idx >= 0 && idx < args.length && args[idx] instanceof Long) {
            return (Long) args[idx];
        }
        return null;
    }

    /** targetId 파라미터 또는 Long 반환값에서 targetId를 추출 */
    private Long extractTargetId(Object[] args, Object result, LogActivity logActivity) {
        if (logActivity.targetIdFromReturn()) {
            if (result instanceof Long) return (Long) result;
            return null;
        }
        int idx = logActivity.targetIdParam();
        if (idx >= 0 && idx < args.length && args[idx] instanceof Long) {
            return (Long) args[idx];
        }
        return null;
    }
}
