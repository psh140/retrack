package com.retrack.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * files 테이블 매핑 VO
 *
 * @since 2026-05-02
 */
@Getter
@Setter
public class FileVO {

    private Long fileId;      // PK
    private Long projectId;   // 과제 ID (FK → projects)
    private String fileName;  // 원본 파일명 (사용자에게 노출)
    @JsonIgnore // 서버 내부 경로 — API 응답 노출 시 디렉토리 구조 유출 및 저장소 교체 시 결합도 문제가 생기므로 제외
    private String filePath;  // 저장 경로 (/app/uploads/UUID.확장자)
    private String fileType;  // MIME 타입
    private Long uploadedBy;  // 업로드한 사용자 ID (FK → users)

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
