package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 연구비 등록/수정 요청 바디 VO
 * POST /api/projects/{id}/budget, PUT /api/projects/{id}/budget/{bid} 에서 사용
 *
 * @since 2026-04-29
 */
@Getter
@Setter
public class BudgetRequestVO {

    private String category;    // 카테고리 (필수): PERSONNEL | TRAVEL | RESEARCH_ACTIVITY | ETC
    private String description; // 사용 내역 설명 (선택)
    private Long amount;        // 사용 금액 (필수)

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime usedAt; // 실제 사용 일시 (필수)
}
