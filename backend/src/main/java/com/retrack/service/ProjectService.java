package com.retrack.service;

import com.retrack.annotation.LogActivity;
import com.retrack.event.StatusChangedEvent;
import com.retrack.exception.BadRequestException;
import com.retrack.exception.NotFoundException;
import com.retrack.exception.UnauthorizedException;
import com.retrack.mapper.NotificationMapper;
import com.retrack.mapper.ProjectMapper;
import com.retrack.mapper.UserMapper;
import com.retrack.vo.NotificationVO;
import com.retrack.vo.PageResponse;
import com.retrack.vo.ProjectHistoryVO;
import com.retrack.vo.ProjectRequestVO;
import com.retrack.vo.ProjectVO;
import com.retrack.vo.UserVO;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
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
 *   3. notifications 알림 기록 INSERT
 * 이메일 발송은 트랜잭션 외부에서 EmailSender를 통해 비동기 처리.
 * 활동 로그는 @LogActivity AOP 어드바이스가 트랜잭션 커밋 후 자동 기록한다.
 *
 * @since 2026-04-28
 * @modified 2026-05-11 상태 변경 시 HTML 템플릿 이메일 자동 발송 연결
 * @modified 2026-05-11 활동 로그 @LogActivity AOP로 전환
 * @modified 2026-05-11 이메일 발송을 @TransactionalEventListener 패턴으로 전환
 *                      (트랜잭션 커밋 보장 후 발송, EmailSender 직접 의존 제거)
 * @modified 2026-05-12 검색 파라미터 추가
 * @modified 2026-05-12 페이지네이션 적용
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

    /** 허용되는 페이지 크기 */
    private static final List<Integer> VALID_PAGE_SIZES = Arrays.asList(10, 20, 50);

    private final ProjectMapper projectMapper;
    private final FileService fileService;
    private final NotificationMapper notificationMapper;
    private final UserMapper userMapper;

    /**
     * Spring의 이벤트 발행 인터페이스.
     * ApplicationContext가 자동으로 주입한다 (별도 빈 선언 불필요).
     * changeStatus()에서 StatusChangedEvent를 발행하는 데 사용한다.
     */
    private final ApplicationEventPublisher eventPublisher;

    public ProjectService(ProjectMapper projectMapper, FileService fileService,
                          NotificationMapper notificationMapper, UserMapper userMapper,
                          ApplicationEventPublisher eventPublisher) {
        this.projectMapper = projectMapper;
        this.fileService = fileService;
        this.notificationMapper = notificationMapper;
        this.userMapper = userMapper;
        this.eventPublisher = eventPublisher;
    }

    /**
     * 검색 조건 + 페이지네이션으로 과제 목록 반환
     * size는 10, 20, 50만 허용 — 그 외 값은 BadRequestException
     *
     * @param params 검색 조건 Map (keyword, status, userId, managerId, startDateFrom/To, endDateFrom/To)
     * @param page   페이지 번호 (1부터 시작)
     * @param size   페이지당 항목 수 (10, 20, 50)
     */
    public PageResponse<ProjectVO> getProjectList(Map<String, Object> params, int page, int size) {
        if (page < 1) {
            throw new BadRequestException("페이지 번호는 1 이상이어야 합니다.");
        }
        if (!VALID_PAGE_SIZES.contains(size)) {
            throw new BadRequestException("페이지 크기는 10, 20, 50만 허용됩니다.");
        }
        params.put("size", size);
        params.put("offset", (page - 1) * size);

        List<ProjectVO> items = projectMapper.findAll(params);
        long totalCount = projectMapper.countAll(params);
        return new PageResponse<>(items, totalCount, page, size);
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
     * ActivityLogAspect가 Long 반환값을 targetId로 사용하여 PROJECT_CREATE 로그를 기록한다.
     *
     * @param req    요청 바디
     * @param userId 로그인 사용자 ID (신청자, index=1)
     * @return 생성된 projectId
     */
    @LogActivity(action = "PROJECT_CREATE", targetType = "PROJECT",
                 userIdParam = 1, targetIdFromReturn = true)
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
        return project.getProjectId();
    }

    /**
     * 과제 수정
     * RESEARCHER는 본인 과제만 수정 가능, MANAGER/ADMIN은 모든 과제 수정 가능.
     * ActivityLogAspect가 PROJECT_UPDATE 로그를 기록한다 (userIdParam=2, targetIdParam=0).
     *
     * @param projectId       수정할 과제 ID (index=0)
     * @param req             요청 바디
     * @param requesterUserId 요청자 ID (index=2)
     * @param requesterRole   요청자 권한
     */
    @LogActivity(action = "PROJECT_UPDATE", targetType = "PROJECT",
                 userIdParam = 2, targetIdParam = 0)
    public void updateProject(Long projectId, ProjectRequestVO req,
                              Long requesterUserId, String requesterRole) {
        ProjectVO project = getProject(projectId);

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
     * <p>3가지 DB 작업이 하나의 트랜잭션으로 묶임:</p>
     * <ol>
     *   <li>projects.status 업데이트</li>
     *   <li>project_history 이력 INSERT</li>
     *   <li>notifications 알림 기록 INSERT</li>
     * </ol>
     *
     * <p>이메일 발송은 트랜잭션 커밋 이후에 실행된다.
     * 메서드 끝에서 {@link StatusChangedEvent}를 발행하면, Spring이 트랜잭션 커밋을 확인한 뒤
     * {@link com.retrack.service.EmailSender#onStatusChanged}를 별도 스레드에서 호출한다.
     * 트랜잭션이 롤백되면 이벤트는 버려지므로 이메일이 발송되지 않는다.</p>
     *
     * <p>ActivityLogAspect가 트랜잭션 커밋 후 PROJECT_STATUS_CHANGE 로그를 기록한다
     * (userIdParam=3, targetIdParam=0, descriptionParam=1 → "→ SUBMITTED" 형태).</p>
     *
     * @param projectId 상태 변경할 과제 ID (index=0)
     * @param newStatus 변경할 상태 (index=1)
     * @param comment   변경 사유 (nullable)
     * @param changedBy 처리자 ID (index=3)
     */
    @LogActivity(action = "PROJECT_STATUS_CHANGE", targetType = "PROJECT",
                 userIdParam = 3, targetIdParam = 0, descriptionParam = 1)
    @Transactional
    public void changeStatus(Long projectId, String newStatus, String comment, Long changedBy) {
        ProjectVO project = getProject(projectId);

        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("유효하지 않은 상태값입니다.");
        }

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

        // 3. 알림 기록 INSERT (useGeneratedKeys로 notificationId 자동 채워짐)
        String message = buildNotificationMessage(project.getTitle(), newStatus);
        NotificationVO notification = new NotificationVO();
        notification.setUserId(project.getUserId());
        notification.setProjectId(projectId);
        notification.setMessage(message);
        notificationMapper.insert(notification);

        // 이메일 발송 — 트랜잭션 커밋 후 실행되도록 이벤트로 발행
        // EmailSender.onStatusChanged()가 @TransactionalEventListener(AFTER_COMMIT)로 수신한다.
        // 수신자가 없거나 이메일이 없으면 이벤트를 발행하지 않는다.
        UserVO recipient = userMapper.findById(project.getUserId());
        if (recipient != null && recipient.getEmail() != null) {
            eventPublisher.publishEvent(new StatusChangedEvent(
                    notification.getNotificationId(),
                    recipient.getEmail(),
                    project.getTitle(),
                    newStatus,
                    LocalDateTime.now(),
                    comment
            ));
        }
    }

    /**
     * 과제 삭제
     * DB CASCADE로 FILES 레코드는 자동 삭제되지만 파일시스템은 직접 정리해야 함.
     * ActivityLogAspect가 PROJECT_DELETE 로그를 기록한다 (userIdParam=1, targetIdParam=0).
     *
     * @param projectId 삭제할 과제 ID (index=0)
     * @param userId    삭제 요청자 ID (index=1)
     * @throws IOException 파일시스템 정리 실패 시
     */
    @LogActivity(action = "PROJECT_DELETE", targetType = "PROJECT",
                 userIdParam = 1, targetIdParam = 0)
    public void deleteProject(Long projectId, Long userId) throws IOException {
        getProject(projectId);
        fileService.deleteAllFilesByProject(projectId);
        projectMapper.deleteProject(projectId);
    }

    /** 특정 과제의 상태 변경 이력 목록 반환 */
    public List<ProjectHistoryVO> getHistory(Long projectId) {
        getProject(projectId);
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
