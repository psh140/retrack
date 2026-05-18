package com.retrack.service;

import com.retrack.exception.BadRequestException;
import com.retrack.exception.UnauthorizedException;
import com.retrack.mapper.NotificationMapper;
import com.retrack.mapper.ProjectMapper;
import com.retrack.mapper.UserMapper;
import com.retrack.vo.ProjectRequestVO;
import com.retrack.vo.ProjectVO;
import com.retrack.vo.UserVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * ProjectService 단위 테스트
 * 상태 머신 전이 규칙, 소유권 검증, changeStatus 원자적 3단계 호출을 검증한다.
 *
 * @since 2026-05-14
 * @modified 2026-05-18 changeStatus 시그니처에 userRole 파라미터 추가 반영
 */
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private FileService fileService;

    @Mock
    private NotificationMapper notificationMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ProjectService projectService;

    /** VALID_TRANSITIONS에 정의되지 않은 전이(COMPLETED → DRAFT) → BadRequestException */
    @Test
    void changeStatus_불허전이_BadRequestException() {
        ProjectVO project = new ProjectVO();
        project.setProjectId(1L);
        project.setStatus("COMPLETED");
        project.setTitle("테스트과제");
        project.setUserId(10L);

        when(projectMapper.findById(1L)).thenReturn(project);

        // RESEARCHER 역할로 호출 — 전이 규칙 적용됨
        assertThrows(BadRequestException.class,
                () -> projectService.changeStatus(1L, "DRAFT", null, 1L, "RESEARCHER"));

        // 전이 불가 시 DB 수정 작업이 실행되어선 안 된다
        verify(projectMapper, never()).updateStatus(anyLong(), anyString());
    }

    /**
     * 허용된 전이(DRAFT → SUBMITTED) 시 3가지 DB 작업이 모두 호출되어야 한다:
     * 1. projectMapper.updateStatus()
     * 2. projectMapper.insertHistory()
     * 3. notificationMapper.insert()
     */
    @Test
    void changeStatus_허용전이_3가지작업모두호출() {
        ProjectVO project = new ProjectVO();
        project.setProjectId(1L);
        project.setStatus("DRAFT");
        project.setTitle("테스트과제");
        project.setUserId(10L);

        UserVO recipient = new UserVO();
        recipient.setUserId(10L);
        recipient.setEmail("user@test.com");

        when(projectMapper.findById(1L)).thenReturn(project);
        when(userMapper.findById(10L)).thenReturn(recipient);

        projectService.changeStatus(1L, "SUBMITTED", null, 1L, "MANAGER");

        verify(projectMapper, times(1)).updateStatus(eq(1L), eq("SUBMITTED"));
        verify(projectMapper, times(1)).insertHistory(any());
        verify(notificationMapper, times(1)).insert(any());
    }

    /** RESEARCHER가 타인 과제 수정 시도 → UnauthorizedException, updateProject 미호출 */
    @Test
    void updateProject_RESEARCHER_타인과제_UnauthorizedException() {
        ProjectVO project = new ProjectVO();
        project.setProjectId(1L);
        project.setUserId(100L);
        project.setStatus("DRAFT");

        when(projectMapper.findById(1L)).thenReturn(project);

        ProjectRequestVO req = new ProjectRequestVO();
        req.setTitle("수정제목");

        assertThrows(UnauthorizedException.class,
                () -> projectService.updateProject(1L, req, 999L, "RESEARCHER"));

        verify(projectMapper, never()).updateProject(any());
    }
}
