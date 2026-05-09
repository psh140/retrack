package com.retrack.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * 알림 발송 요청 바디 VO
 * POST /api/notifications/send 에서 사용
 *
 * @since 2026-05-09
 */
@Getter
@Setter
public class NotificationRequestVO {

    private Long userId;        // 수신자 ID (필수)
    private Long projectId;     // 관련 과제 ID (선택)
    private String message;     // 발송 메시지 내용 (필수)
}
