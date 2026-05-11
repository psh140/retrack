package com.retrack.service;

import com.retrack.mapper.NotificationMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 비동기 이메일 발송 전담 컴포넌트
 *
 * NotificationService에서 직접 @Async 메서드를 호출하면 Spring 프록시를 거치지 않아
 * 비동기 처리가 적용되지 않음 (self-invocation 문제). 이를 방지하기 위해 별도 빈으로 분리.
 *
 * @since 2026-05-09
 * @modified 2026-05-11 sendStatusChangeEmailAsync() 추가 — HTML 템플릿 기반 상태 변경 알림
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
     * 과제 상태 변경 이메일 비동기 발송 (HTML 템플릿 기반)
     * resources/templates/notification.html 을 로드하여 플레이스홀더를 치환 후 발송
     * 성공 시 SENT, 실패 시 FAILED로 상태 업데이트
     *
     * @param notificationId 상태를 업데이트할 알림 ID
     * @param recipientEmail 수신자 이메일
     * @param projectTitle   과제명
     * @param status         변경된 상태 (SUBMITTED / REVIEWING / APPROVED / REJECTED / IN_PROGRESS / COMPLETED)
     * @param changedAt      변경 일시
     * @param comment        변경 사유 (null 허용 — null이면 메일에서 생략)
     */
    @Async
    public void sendStatusChangeEmailAsync(Long notificationId, String recipientEmail,
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
