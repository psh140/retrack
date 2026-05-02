package com.retrack.mapper;

import com.retrack.vo.FileVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 파일 관련 DB 쿼리 인터페이스
 * SQL은 resources/mapper/FileMapper.xml 에 정의
 *
 * @since 2026-05-02
 */
@Mapper
public interface FileMapper {

    /** 특정 과제의 파일 목록 조회 (등록일 역순) */
    List<FileVO> findByProjectId(Long projectId);

    /**
     * 파일 단건 조회 (projectId + fileId 조합)
     * 과제 소속 여부 검증 및 다운로드 경로 조회에 사용
     */
    FileVO findById(@Param("projectId") Long projectId, @Param("fileId") Long fileId);

    /**
     * 파일 정보 등록
     * useGeneratedKeys=true 로 INSERT 후 fileId 자동 주입
     */
    void insert(FileVO file);

    /** 파일 삭제 (projectId 함께 확인하여 타 과제 파일 삭제 방지) */
    void delete(@Param("projectId") Long projectId, @Param("fileId") Long fileId);

    /** 과제에 속한 전체 파일 목록 조회 — 과제 삭제 시 파일시스템 정리에 사용 */
    List<FileVO> findAllByProjectId(Long projectId);
}
