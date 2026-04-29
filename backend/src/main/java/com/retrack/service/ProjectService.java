package com.retrack.service;

import com.retrack.exception.BadRequestException;
import com.retrack.exception.NotFoundException;
import com.retrack.exception.UnauthorizedException;
import com.retrack.mapper.ProjectMapper;
import com.retrack.vo.ProjectHistoryVO;
import com.retrack.vo.ProjectRequestVO;
import com.retrack.vo.ProjectVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 과제 관리 비즈니스 로직
 *
 * 상태 변경(changeStatus)은 아래 3가지 작업이 하나의 트랜잭션으로 묶임:
 *   1. projects 테이블 status 업데이트
 *   2. project_history 이력 INSERT
 *   3. k_notifications 알림 기록 INSERT
 * 카카오 알림톡 API 호출은 트랜잭션 외부에서 별도 처리 (8단계에서 구현)
 *
 * @since 2026-04-28
 */
@Service
public class ProjectService {

    /** 허용되는 과제 상태 값 */
    private static final List<String> VALID_STATUSES = Arrays.asList(
            "DRAFT", "SUBMITTED", "REVIEWING", "APPROVED", "REJECTED", "IN_PROGRESS", "COMPLETED"
    );

    /**
     * 유효한 상태 전이 규칙
     * DRAFT → SUBMITTED → REVIEWING → APPROVED → IN_PROGRESS → COMPLETED
     *                                           ↘ REJECTED
     */
    private static final Map<String, List<String>> VALID_TRANSITIONS = new HashMap<>();
    static {
        VALID_TRANSITIONS.put("DRAFT",       Arrays.asList("SUBMITTED"));
        VALID_TRANSITIONS.put("SUBMITTED",   Arrays.asList("REVIEWING"));
        VALID_TRANSITIONS.put("REVIEWING",   Arrays.asList("APPROVED", "REJECTED"));
        VALID_TRANSITIONS.put("APPROVED",    Arrays.asList("IN_PROGRESS"));
        VALID_TRANSITIONS.put("IN_PROGRESS", Arrays.asList("COMPLETED"));
        VALID_TRANSITIONS.put("REJECTED",    Arrays.asList());
        VALID_TRANSITIONS.put("COMPLETED",   Arrays.asList());
    }

    private final ProjectMapper projectMapper;

    public ProjectService(ProjectMapper projectMapper) {
        this.projectMapper = projectMapper;
    }

    /** 전체 과제 목록 반환 */
    public List<ProjectVO> getProjectList() {
        return projectMapper.findAll();
    }

    /**
     * 과제 단건 조회
     * 존재하지 않으면 NotFoundException 발생
     */
    public ProjectVO getProject(Long projectId) {
        ProjectVO project = projectMapper.findById(projectId);
        if (project == null) {
            throw new NotFoundException("존재하지 않는 과제입니다.");
        }
        return project;
    }

    /**
     * 과제 등록
     * @param req    요청 바디
     * @param userId 로그인 사용자 ID (신청자)
     * @return 생성된 projectId
     */
    public Long createProject(ProjectRequestVO req, Long userId) {
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new BadRequestException("과제명은 필수입니다.");
        }
        ProjectVO project = new ProjectVO();
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setUserId(userId);
        project.setManagerId(req.getManagerId());
        project.setStartDate(req.getStartDate());
        project.setEndDate(req.getEndDate());
        project.setBudgetTotal(req.getBudgetTotal() != null ? req.getBudgetTotal() : 0L);

        projectMapper.insertProject(project);
        return project.getProjectId(); // useGeneratedKeys로 자동 주입된 PK
    }

    /**
     * 과제 수정
     * RESEARCHER는 본인 과제만 수정 가능, MANAGER/ADMIN은 모든 과제 수정 가능
     *
     * @param projectId     수정할 과제 ID
     * @param req           요청 바디
     * @param requesterUserId 요청자 ID
     * @param requesterRole   요청자 권한
     */
    public void updateProject(Long projectId, ProjectRequestVO req,
                              Long requesterUserId, String requesterRole) {
        ProjectVO project = getProject(projectId);

        // RESEARCHER는 본인 과제만 수정 가능
        if ("RESEARCHER".equals(requesterRole) && !project.getUserId().equals(requesterUserId)) {
            throw new UnauthorizedException("본인이 등록한 과제만 수정할 수 있습니다.");
        }
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new BadRequestException("과제명은 필수입니다.");
        }

        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setManagerId(req.getManagerId());
        project.setStartDate(req.getStartDate());
        project.setEndDate(req.getEndDate());
        project.setBudgetTotal(req.getBudgetTotal());
        projectMapper.updateProject(project);
    }

    /**
     * 과제 상태 변경 — 트랜잭션 처리
     *
     * 3가지 DB 작업이 하나의 트랜잭션으로 묶임:
     *   1. projects.status 업데이트
     *   2. project_history 이력 INSERT
     *   3. k_notifications 알림 기록 INSERT
     *
     * @param projectId   상태 변경할 과제 ID
     * @param newStatus   변경할 상태
     * @param comment     변경 사유
     * @param changedBy   처리자 ID
     */
    @Transactional
    public void changeStatus(Long projectId, String newStatus, String comment, Long changedBy) {
        ProjectVO project = getProject(projectId);

        // 유효한 상태값인지 확인
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("유효하지 않은 상태값입니다.");
        }

        // 허용된 전이인지 확인
        List<String> allowedNext = VALID_TRANSITIONS.get(project.getStatus());
        if (allowedNext == null || !allowedNext.contains(newStatus)) {
            throw new BadRequestException(
                    project.getStatus() + " → " + newStatus + " 전이는 허용되지 않습니다."
            );
        }

        // 1. 상태 업데이트
        projectMapper.updateStatus(projectId, newStatus);

        // 2. 이력 INSERT
        ProjectHistoryVO history = new ProjectHistoryVO();
        history.setProjectId(projectId);
        history.setChangedBy(changedBy);
        history.setPrevStatus(project.getStatus());
        history.setNewStatus(newStatus);
        history.setComment(comment);
        projectMapper.insertHistory(history);

        // 3. 알림 기록 INSERT (카카오 발송은 트랜잭션 외부 — 8단계에서 구현)
        String message = buildNotificationMessage(project.getTitle(), newStatus);
        projectMapper.insertNotification(project.getUserId(), projectId, message);
    }

    /**
     * 과제 삭제
     * 존재하지 않으면 NotFoundException 발생
     */
    public void deleteProject(Long projectId) {
        getProject(projectId); // 존재 여부 확인
        projectMapper.deleteProject(projectId);
    }

    /** 특정 과제의 상태 변경 이력 목록 반환 */
    public List<ProjectHistoryVO> getHistory(Long projectId) {
        getProject(projectId); // 과제 존재 여부 확인
        return projectMapper.findHistoryByProjectId(projectId);
    }

    /** 상태별 알림 메시지 생성 */
    private String buildNotificationMessage(String title, String status) {
        switch (status) {
            case "SUBMITTED":   return "과제 '" + title + "'이(가) 제출되었습니다.";
            case "REVIEWING":   return "과제 '" + title + "'이(가) 검토 중입니다.";
            case "APPROVED":    return "과제 '" + title + "'이(가) 승인되었습니다.";
            case "REJECTED":    return "과제 '" + title + "'이(가) 반려되었습니다.";
            case "IN_PROGRESS": return "과제 '" + title + "'이(가) 진행 중입니다.";
            case "COMPLETED":   return "과제 '" + title + "'이(가) 완료되었습니다.";
            default:            return "과제 '" + title + "' 상태가 변경되었습니다.";
        }
    }
}
