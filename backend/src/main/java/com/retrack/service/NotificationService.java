package com.retrack.service;

import com.retrack.annotation.LogActivity;
import com.retrack.exception.BadRequestException;
import com.retrack.exception.NotFoundException;
import com.retrack.mapper.NotificationMapper;
import com.retrack.mapper.UserMapper;
import com.retrack.vo.NotificationRequestVO;
import com.retrack.vo.NotificationVO;
import com.retrack.vo.UserVO;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 알림 관리 비즈니스 로직
 * 이메일 발송은 EmailSender(@Async)에 위임하여 비동기 처리.
 * 활동 로그는 @LogActivity AOP 어드바이스가 자동 기록한다.
 *
 * @since 2026-05-09
 * @modified 2026-05-11 활동 로그 @LogActivity AOP로 전환
 */
@Service
public class NotificationService {

    private final NotificationMapper notificationMapper;
    private final UserMapper userMapper;
    private final EmailSender emailSender;

    public NotificationService(NotificationMapper notificationMapper,
                               UserMapper userMapper,
                               EmailSender emailSender) {
        this.notificationMapper = notificationMapper;
        this.userMapper = userMapper;
        this.emailSender = emailSender;
    }

    /**
     * 로그인 사용자의 알림 목록 반환 (최신순)
     *
     * @param userId 로그인 사용자 ID
     */
    public List<NotificationVO> getMyNotifications(Long userId) {
        return notificationMapper.findByUserId(userId);
    }

    /**
     * 알림 단건 조회
     * 존재하지 않으면 NotFoundException 발생
     *
     * @param notificationId 조회할 알림 ID
     */
    public NotificationVO getNotification(Long notificationId) {
        NotificationVO notification = notificationMapper.findById(notificationId);
        if (notification == null) {
            throw new NotFoundException("존재하지 않는 알림입니다.");
        }
        return notification;
    }

    /**
     * 알림 발송
     * DB에 PENDING 상태로 저장 후 EmailSender를 통해 비동기 이메일 발송.
     * ActivityLogAspect가 Long 반환값을 targetId로 사용하여 NOTIFICATION_SEND 로그를 기록한다
     * (userIdParam=1, targetIdFromReturn=true).
     *
     * @param req      수신자 ID, 과제 ID, 메시지 내용 (index=0)
     * @param senderId 발송자(MANAGER/ADMIN) ID (index=1)
     * @return 생성된 notificationId
     */
    @LogActivity(action = "NOTIFICATION_SEND", targetType = "NOTIFICATION",
                 userIdParam = 1, targetIdFromReturn = true)
    public Long sendNotification(NotificationRequestVO req, Long senderId) {
        if (req.getUserId() == null) {
            throw new BadRequestException("수신자 ID는 필수입니다.");
        }
        if (req.getMessage() == null || req.getMessage().trim().isEmpty()) {
            throw new BadRequestException("메시지 내용은 필수입니다.");
        }

        UserVO recipient = userMapper.findById(req.getUserId());
        if (recipient == null) {
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }

        NotificationVO notification = new NotificationVO();
        notification.setUserId(req.getUserId());
        notification.setProjectId(req.getProjectId());
        notification.setMessage(req.getMessage());
        notificationMapper.insert(notification);

        emailSender.sendEmailAsync(notification.getNotificationId(), recipient.getEmail(), req.getMessage());

        return notification.getNotificationId();
    }
}
