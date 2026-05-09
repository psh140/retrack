package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.NotificationService;
import com.retrack.vo.ApiResponse;
import com.retrack.vo.NotificationRequestVO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

/**
 * 알림 API 엔드포인트
 * GET  /api/notifications        — 내 알림 목록 조회 (VIEWER 이상)
 * POST /api/notifications/send   — 알림 발송 (MANAGER 이상)
 * GET  /api/notifications/{id}   — 알림 상세 조회 (VIEWER 이상)
 *
 * @since 2026-05-09
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** 로그인 사용자의 알림 목록 조회 */
    @GetMapping
    @RequiredRole("VIEWER")
    public ResponseEntity<ApiResponse<?>> getMyNotifications(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.ok("알림 목록 조회 성공",
                notificationService.getMyNotifications(userId)));
    }

    /** 알림 발송 — DB 저장 후 이메일 비동기 발송 */
    @PostMapping("/send")
    @RequiredRole("MANAGER")
    public ResponseEntity<ApiResponse<?>> sendNotification(@RequestBody NotificationRequestVO req) {
        Long notificationId = notificationService.sendNotification(req);
        return ResponseEntity.ok(ApiResponse.ok("알림 발송 요청이 완료됐습니다.", notificationId));
    }

    /** 알림 단건 상세 조회 */
    @GetMapping("/{id}")
    @RequiredRole("VIEWER")
    public ResponseEntity<ApiResponse<?>> getNotification(@PathVariable("id") Long notificationId) {
        return ResponseEntity.ok(ApiResponse.ok("알림 조회 성공",
                notificationService.getNotification(notificationId)));
    }
}
