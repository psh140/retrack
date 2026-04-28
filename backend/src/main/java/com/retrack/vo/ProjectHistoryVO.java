package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * project_history 테이블 매핑 VO
 * 과제 상태 변경 시마다 이력이 INSERT됨 (UPDATE 없음)
 */
@Getter
@Setter
public class ProjectHistoryVO {

    private Long historyId;    // PK
    private Long projectId;    // FK → projects
    private Long changedBy;    // 상태 변경 처리자 ID (FK → users)
    private String prevStatus; // 변경 전 상태 (최초 등록 시 null)
    private String newStatus;  // 변경 후 상태

    private String comment;    // 변경 사유 또는 코멘트

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime changedAt; // 변경 일시
}
