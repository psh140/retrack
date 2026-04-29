package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * budget 테이블 매핑 VO
 * 카테고리: PERSONNEL(인건비), TRAVEL(여비), RESEARCH_ACTIVITY(연구활동비), ETC(기타)
 *
 * @since 2026-04-29
 */
@Getter
@Setter
public class BudgetVO {

    private Long budgetId;      // PK
    private Long projectId;     // 과제 ID (FK → projects)
    private String category;    // 예산 카테고리
    private String description; // 사용 내역 설명
    private Long amount;        // 사용 금액

    private Long usedBy;        // 사용자 ID (FK → users)

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime usedAt;   // 실제 사용 일시

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
