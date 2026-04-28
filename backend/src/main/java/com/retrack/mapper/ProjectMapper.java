package com.retrack.mapper;

import com.retrack.vo.ProjectHistoryVO;
import com.retrack.vo.ProjectVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 과제 관리 관련 DB 쿼리 인터페이스
 * SQL은 resources/mapper/ProjectMapper.xml 에 정의
 */
@Mapper
public interface ProjectMapper {

    /** 전체 과제 목록 조회 (최신 등록순) */
    List<ProjectVO> findAll();

    /** 과제 ID로 단건 조회 */
    ProjectVO findById(Long projectId);

    /**
     * 과제 등록
     * useGeneratedKeys=true 로 INSERT 후 projectId가 자동 채워짐
     */
    void insertProject(ProjectVO project);

    /** 과제 수정 (title, description, managerId, startDate, endDate, budgetTotal) */
    void updateProject(ProjectVO project);

    /**
     * 과제 상태 업데이트
     * changeStatus() 트랜잭션 내 1번 작업
     */
    void updateStatus(@Param("projectId") Long projectId, @Param("status") String status);

    /** 과제 삭제 */
    void deleteProject(Long projectId);

    /**
     * 상태 변경 이력 INSERT
     * changeStatus() 트랜잭션 내 2번 작업
     */
    void insertHistory(ProjectHistoryVO history);

    /**
     * 알림 기록 INSERT (카카오 발송 전 DB 선기록)
     * changeStatus() 트랜잭션 내 3번 작업
     */
    void insertNotification(@Param("userId") Long userId,
                            @Param("projectId") Long projectId,
                            @Param("message") String message);

    /** 특정 과제의 상태 변경 이력 목록 조회 (최신순) */
    List<ProjectHistoryVO> findHistoryByProjectId(Long projectId);
}
