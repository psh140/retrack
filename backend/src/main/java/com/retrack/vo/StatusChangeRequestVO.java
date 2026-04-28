package com.retrack.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * 과제 상태 변경 요청 바디 VO
 * PATCH /api/projects/{id}/status 에서 사용
 */
@Getter
@Setter
public class StatusChangeRequestVO {

    private String status;   // 변경할 상태값 (필수)
    private String comment;  // 변경 사유 (선택)
}
