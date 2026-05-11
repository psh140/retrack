package com.retrack.service;

import com.retrack.event.StatusChangedEvent;
import com.retrack.mapper.NotificationMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 이메일 발송 전담 컴포넌트
 *
 * <h3>역할</h3>
 * <ul>
 *   <li>수동 알림 발송: {@link #sendEmailAsync} — @Async 직접 호출</li>
 *   <li>상태 변경 알림: {@link #onStatusChanged} — @TransactionalEventListener로 수신</li>
 * </ul>
 *
 * <h3>self-invocation 방지</h3>
 * <p>Spring의 @Async, @TransactionalEventListener는 프록시 기반이라 같은 빈 내부에서
 * 직접 호출하면 적용되지 않는다. 이 클래스를 별도 빈으로 분리한 이유가 여기 있다.</p>
 *
 * <h3>상태 변경 이메일 흐름</h3>
 * <pre>
 * ProjectService.changeStatus() [@Transactional]
 *   → DB 작업 완료 후 StatusChangedEvent 발행
 *   → 트랜잭션 커밋
 *
 * EmailSender.onStatusChanged() [@TransactionalEventListener(AFTER_COMMIT) + @Async]
 *   → 커밋 확인 후 스레드 풀에서 실행
 *   → HTML 템플릿 이메일 발송 + notifications.status 업데이트
 * </pre>
 *
 * @since 2026-05-09
 * @modified 2026-05-11 sendStatusChangeEmailAsync() 추가 — HTML 템플릿 기반 상태 변경 알림
 * @modified 2026-05-11 onStatusChanged() 추가 — @TransactionalEventListener 패턴으로 전환
 */
@Slf4j
@Component
public class EmailSender {

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final JavaMailSender mailSender;
    private final NotificationMapper notificationMapper;

    public EmailSender(JavaMailSender mailSender, NotificationMapper notificationMapper) {
        this.mailSender = mailSender;
        this.notificationMapper = notificationMapper;
    }

    /**
     * 자유 형식 메시지 이메일 비동기 발송 (수동 알림 발송 API에서 사용)
     * 성공 시 SENT, 실패 시 FAILED로 상태 업데이트
     *
     * @param notificationId 상태를 업데이트할 알림 ID
     * @param recipientEmail 수신자 이메일
     * @param message        발송 메시지 내용
     */
    @Async
    public void sendEmailAsync(Long notificationId, String recipientEmail, String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setFrom(System.getenv("MAIL_USERNAME"), "Retrack 알림");
            helper.setTo(recipientEmail);
            helper.setSubject("[Retrack] 연구과제 알림");
            helper.setText(message);
            mailSender.send(mimeMessage);

            notificationMapper.updateStatus(notificationId, "SENT", LocalDateTime.now());
            log.info("이메일 발송 성공 — notificationId={}, recipient={}", notificationId, recipientEmail);
        } catch (Exception e) {
            log.error("이메일 발송 실패 — notificationId={}, recipient={}", notificationId, recipientEmail, e);
            notificationMapper.updateStatus(notificationId, "FAILED", LocalDateTime.now());
        }
    }

    /**
     * 과제 상태 변경 이벤트 리스너 — 트랜잭션 커밋 후 이메일 비동기 발송
     *
     * <p>{@code @TransactionalEventListener(phase = AFTER_COMMIT)}: 트랜잭션이 성공적으로
     * 커밋된 후에만 이 메서드가 호출된다. 트랜잭션이 롤백되면 이벤트는 버려진다.</p>
     *
     * <p>{@code @Async}: 이벤트 발행 스레드(HTTP 요청 처리 스레드)를 블록하지 않도록
     * 별도 스레드 풀에서 실행한다. 사용자 응답은 커밋 즉시 반환되고 이메일 발송은
     * 백그라운드에서 진행된다.</p>
     *
     * <p>두 어노테이션이 함께 동작하는 순서:</p>
     * <ol>
     *   <li>트랜잭션 커밋 완료</li>
     *   <li>Spring이 AFTER_COMMIT 단계 리스너를 탐색, 이 메서드를 스레드 풀에 제출</li>
     *   <li>HTTP 응답 반환 (사용자 대기 종료)</li>
     *   <li>스레드 풀에서 이 메서드 실행 → SMTP 발송 → notifications.status 업데이트</li>
     * </ol>
     *
     * @param event ProjectService.changeStatus()가 발행한 상태 변경 이벤트
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void onStatusChanged(StatusChangedEvent event) {
        sendStatusChangeEmail(
                event.getNotificationId(),
                event.getRecipientEmail(),
                event.getProjectTitle(),
                event.getStatus(),
                event.getChangedAt(),
                event.getComment()
        );
    }

    /**
     * 과제 상태 변경 이메일 발송 내부 구현
     * resources/templates/notification.html 을 로드하여 플레이스홀더를 치환 후 발송.
     * 성공 시 SENT, 실패 시 FAILED로 notifications.status 업데이트.
     *
     * @param notificationId 상태를 업데이트할 알림 ID
     * @param recipientEmail 수신자 이메일
     * @param projectTitle   과제명
     * @param status         변경된 상태
     * @param changedAt      변경 일시
     * @param comment        변경 사유 (null 허용)
     */
    private void sendStatusChangeEmail(Long notificationId, String recipientEmail,
                                       String projectTitle, String status,
                                       LocalDateTime changedAt, String comment) {
        try {
            String html = loadTemplate(projectTitle, status, changedAt, comment);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setFrom(System.getenv("MAIL_USERNAME"), "Retrack 알림");
            helper.setTo(recipientEmail);
            helper.setSubject("[Retrack] 연구과제 상태 변경 안내");
            helper.setText(html, true);
            mailSender.send(mimeMessage);

            notificationMapper.updateStatus(notificationId, "SENT", LocalDateTime.now());
            log.info("상태 변경 이메일 발송 성공 — notificationId={}, recipient={}, status={}",
                    notificationId, recipientEmail, status);
        } catch (Exception e) {
            log.error("상태 변경 이메일 발송 실패 — notificationId={}, recipient={}",
                    notificationId, recipientEmail, e);
            notificationMapper.updateStatus(notificationId, "FAILED", LocalDateTime.now());
        }
    }


    /**
     * notification.html 템플릿 로드 후 플레이스홀더 치환
     * COMMENT_SECTION은 comment가 null이면 빈 문자열로 치환
     */
    private String loadTemplate(String projectTitle, String status,
                                LocalDateTime changedAt, String comment) throws IOException {
        InputStream is = getClass().getClassLoader()
                .getResourceAsStream("templates/notification.html");
        if (is == null) {
            throw new IOException("이메일 템플릿 파일을 찾을 수 없습니다: templates/notification.html");
        }
        String template = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        String commentSection = (comment != null && !comment.trim().isEmpty())
                ? "<p>사유: " + comment + "</p>"
                : "";

        return template
                .replace("{{PROJECT_TITLE}}", projectTitle)
                .replace("{{STATUS_TEXT}}", resolveStatusText(status))
                .replace("{{CHANGED_AT}}", changedAt.format(DISPLAY_FORMATTER))
                .replace("{{COMMENT_SECTION}}", commentSection);
    }

    /** 상태 코드 → 한글 텍스트 변환 */
    private String resolveStatusText(String status) {
        switch (status) {
            case "SUBMITTED":   return "제출됨";
            case "REVIEWING":   return "검토 중";
            case "APPROVED":    return "승인됨";
            case "REJECTED":    return "반려됨";
            case "IN_PROGRESS": return "진행 중";
            case "COMPLETED":   return "완료됨";
            default:            return status;
        }
    }
}
