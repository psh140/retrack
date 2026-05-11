package com.retrack.event;

import java.time.LocalDateTime;

/**
 * 과제 상태 변경 도메인 이벤트
 *
 * <p>Spring의 ApplicationEventPublisher를 통해 발행되며,
 * {@link com.retrack.service.EmailSender#onStatusChanged} 리스너가 수신한다.</p>
 *
 * <h3>설계 의도</h3>
 * <p>과제 상태 변경 트랜잭션이 성공적으로 커밋된 후에만 이메일을 발송해야 한다.
 * 이를 보장하기 위해 이메일 발송 호출을 {@code @Transactional} 메서드 내부에 직접 두지 않고,
 * 트랜잭션 커밋 후 이벤트를 발행하는 방식으로 분리했다.</p>
 *
 * <h3>이벤트 흐름</h3>
 * <pre>
 * ProjectService.changeStatus() [@Transactional]
 *   → DB 작업 (status 업데이트 / 이력 / 알림 기록)
 *   → applicationEventPublisher.publishEvent(StatusChangedEvent)
 *   → 트랜잭션 커밋
 *
 * EmailSender.onStatusChanged() [@TransactionalEventListener(AFTER_COMMIT) + @Async]
 *   → 커밋 확인 후 별도 스레드에서 실행
 *   → Gmail SMTP 발송 + notifications.status 업데이트
 * </pre>
 *
 * <p>트랜잭션이 롤백되면 이벤트는 버려지고 이메일은 발송되지 않는다.
 * 반대로 커밋이 확정된 후에만 리스너가 실행되므로 "상태 변경 없이 이메일만 나가는" 상황이 원천 차단된다.</p>
 *
 * <p>이 클래스는 불변 객체다. 생성 후 필드를 변경할 수 없다.</p>
 *
 * @since 2026-05-11
 */
public class StatusChangedEvent {

    /** 알림 기록 ID — 이메일 발송 후 status를 SENT/FAILED로 업데이트할 때 사용 */
    private final Long notificationId;

    /** 수신자 이메일 주소 */
    private final String recipientEmail;

    /** 과제명 — 이메일 본문에 표시 */
    private final String projectTitle;

    /** 변경된 상태 코드 (SUBMITTED / REVIEWING / APPROVED / REJECTED / IN_PROGRESS / COMPLETED) */
    private final String status;

    /** 상태 변경 일시 — 이메일 본문에 표시 */
    private final LocalDateTime changedAt;

    /** 변경 사유 (null 허용 — null이면 이메일에서 생략) */
    private final String comment;

    /**
     * 이벤트 생성자
     *
     * @param notificationId 알림 기록 ID
     * @param recipientEmail 수신자 이메일
     * @param projectTitle   과제명
     * @param status         변경된 상태 코드
     * @param changedAt      변경 일시
     * @param comment        변경 사유 (nullable)
     */
    public StatusChangedEvent(Long notificationId, String recipientEmail,
                              String projectTitle, String status,
                              LocalDateTime changedAt, String comment) {
        this.notificationId = notificationId;
        this.recipientEmail = recipientEmail;
        this.projectTitle   = projectTitle;
        this.status         = status;
        this.changedAt      = changedAt;
        this.comment        = comment;
    }

    /** @return 알림 기록 ID */
    public Long getNotificationId() { return notificationId; }

    /** @return 수신자 이메일 */
    public String getRecipientEmail() { return recipientEmail; }

    /** @return 과제명 */
    public String getProjectTitle() { return projectTitle; }

    /** @return 변경된 상태 코드 */
    public String getStatus() { return status; }

    /** @return 상태 변경 일시 */
    public LocalDateTime getChangedAt() { return changedAt; }

    /** @return 변경 사유 (null 가능) */
    public String getComment() { return comment; }
}
