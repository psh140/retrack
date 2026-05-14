package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * notifications 테이블 매핑 VO
 * status: PENDING(발송 대기) / SENT(발송 완료) / FAILED(발송 실패)
 *
 * @since 2026-05-09
 * @modified 2026-05-14 createdAt 필드 추가 (DB 스키마 반영)
 */
@Getter
@Setter
public class NotificationVO {

    private Long notificationId;    // PK
    private Long userId;            // 수신자 ID (FK: users)
    private Long projectId;         // 관련 과제 ID (FK: projects, nullable)
    private String message;         // 발송 메시지 내용
    private String status;          // 발송 상태 (PENDING / SENT / FAILED)

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime sentAt;   // 실제 발송 완료 일시

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt; // 알림 생성 일시
}
