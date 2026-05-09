package com.retrack.service;

import com.retrack.mapper.NotificationMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import javax.mail.internet.MimeMessage;
import java.time.LocalDateTime;

/**
 * 비동기 이메일 발송 전담 컴포넌트
 *
 * NotificationService에서 직접 @Async 메서드를 호출하면 Spring 프록시를 거치지 않아
 * 비동기 처리가 적용되지 않음 (self-invocation 문제). 이를 방지하기 위해 별도 빈으로 분리.
 *
 * @since 2026-05-09
 * @modified 2026-05-09 발신자 표시 이름 "Retrack 알림" 추가
 */
@Slf4j
@Component
public class EmailSender {

    private final JavaMailSender mailSender;
    private final NotificationMapper notificationMapper;

    public EmailSender(JavaMailSender mailSender, NotificationMapper notificationMapper) {
        this.mailSender = mailSender;
        this.notificationMapper = notificationMapper;
    }

    /**
     * 이메일 비동기 발송 후 알림 상태 업데이트
     * 성공 시 SENT, 실패 시 FAILED로 기록
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
}
