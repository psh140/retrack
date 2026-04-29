package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 과제 등록/수정 요청 바디 VO
 * POST /api/projects, PUT /api/projects/{id} 에서 사용
 *
 * @since 2026-04-28
 */
@Getter
@Setter
public class ProjectRequestVO {

    private String title;        // 과제명 (필수)
    private String description;  // 과제 설명
    private Long managerId;      // 담당자 ID (선택)

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate; // 과제 시작일 (선택)

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;   // 과제 종료일 (선택)

    private Long budgetTotal;    // 총 연구비 (선택)
}
