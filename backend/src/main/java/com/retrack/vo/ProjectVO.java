package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * projects 테이블 매핑 VO
 * 과제 상태 흐름: DRAFT → SUBMITTED → REVIEWING → APPROVED → IN_PROGRESS → COMPLETED
 *                                                           ↘ REJECTED
 *
 * @since 2026-04-28
 */
@Getter
@Setter
public class ProjectVO {

    private Long projectId;       // PK
    private String title;         // 과제명
    private String description;   // 과제 설명
    private String status;        // 과제 상태 (기본값: DRAFT)
    private Long userId;          // 신청자 ID (FK → users)
    private Long managerId;       // 담당자 ID (FK → users, nullable)

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;  // 과제 시작일

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;    // 과제 종료일

    private Long budgetTotal;     // 총 연구비 (기본값: 0)

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
