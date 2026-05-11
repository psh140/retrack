package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 사용자 활동 로그 VO
 * activity_logs 테이블 매핑 객체
 * - 로그인/로그아웃, 과제/연구비/파일 CRUD, 알림 발송, 사용자 관리 작업을 기록
 * - ip_address는 현재 구현에서 null로 처리
 *
 * @since 2026-05-11
 */
public class ActivityLogVO {

    /** 로그 PK */
    private Long logId;

    /** 행위자 사용자 ID */
    private Long userId;

    /** 수행한 액션 (LOGIN, PROJECT_CREATE 등) */
    private String action;

    /** 대상 타입 (PROJECT, BUDGET, FILE, NOTIFICATION, USER) — nullable */
    private String targetType;

    /** 대상 엔티티 ID — nullable */
    private Long targetId;

    /** 액션 상세 설명 — nullable */
    private String description;

    /** 요청자 IP 주소 — nullable (현재 null로 처리) */
    private String ipAddress;

    /** 로그 생성 시각 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /** 기본 생성자 */
    public ActivityLogVO() {}

    /** logId getter */
    public Long getLogId() {
        return logId;
    }

    /** logId setter */
    public void setLogId(Long logId) {
        this.logId = logId;
    }

    /** userId getter */
    public Long getUserId() {
        return userId;
    }

    /** userId setter */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /** action getter */
    public String getAction() {
        return action;
    }

    /** action setter */
    public void setAction(String action) {
        this.action = action;
    }

    /** targetType getter */
    public String getTargetType() {
        return targetType;
    }

    /** targetType setter */
    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    /** targetId getter */
    public Long getTargetId() {
        return targetId;
    }

    /** targetId setter */
    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    /** description getter */
    public String getDescription() {
        return description;
    }

    /** description setter */
    public void setDescription(String description) {
        this.description = description;
    }

    /** ipAddress getter */
    public String getIpAddress() {
        return ipAddress;
    }

    /** ipAddress setter */
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    /** createdAt getter */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /** createdAt setter */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
