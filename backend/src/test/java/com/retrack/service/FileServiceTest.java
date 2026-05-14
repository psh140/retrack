package com.retrack.service;

import com.retrack.exception.UnauthorizedException;
import com.retrack.mapper.FileMapper;
import com.retrack.mapper.ProjectMapper;
import com.retrack.storage.FileStorageStrategy;
import com.retrack.vo.FileVO;
import com.retrack.vo.ProjectVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * FileService 단위 테스트
 * 파일시스템 롤백, 소유권 검증, 역할 분기를 검증한다.
 *
 * @since 2026-05-14
 */
@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private FileMapper fileMapper;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private FileStorageStrategy fileStorageStrategy;

    @InjectMocks
    private FileService fileService;

    /** 허용되지 않는 확장자(.exe) 업로드 시 BadRequestException 발생 — 보안 화이트리스트 검증 */
    @Test
    void uploadFile_불허확장자_BadRequestException() throws Exception {
        ProjectVO project = new ProjectVO();
        project.setProjectId(1L);
        when(projectMapper.findById(1L)).thenReturn(project);

        MockMultipartFile file = new MockMultipartFile(
                "file", "malware.exe", "application/octet-stream", "data".getBytes()
        );

        assertThrows(com.retrack.exception.BadRequestException.class,
                () -> fileService.uploadFile(1L, file, 1L));

        // 확장자 검증에서 차단되므로 파일 저장 자체가 호출되지 않아야 한다
        verify(fileStorageStrategy, never()).store(any(), any());
    }

    /**
     * DB INSERT 실패 시 이미 저장된 파일을 롤백 삭제해야 한다.
     * @Transactional은 파일시스템을 롤백하지 않으므로 FileService 내부에서 수동 처리.
     */
    @Test
    void uploadFile_DB실패시파일롤백() throws Exception {
        ProjectVO project = new ProjectVO();
        project.setProjectId(1L);
        when(projectMapper.findById(1L)).thenReturn(project);

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", "data".getBytes()
        );

        when(fileStorageStrategy.store(any(), any())).thenReturn("/uploads/xxx.pdf");
        doThrow(new RuntimeException("DB error")).when(fileMapper).insert(any());

        assertThrows(RuntimeException.class, () -> fileService.uploadFile(1L, file, 1L));

        // 저장된 파일이 반드시 롤백 삭제되어야 한다
        verify(fileStorageStrategy, times(1)).delete("/uploads/xxx.pdf");
    }

    /** RESEARCHER가 타인 업로드 파일 삭제 시도 → UnauthorizedException */
    @Test
    void deleteFile_RESEARCHER_타인파일_UnauthorizedException() throws Exception {
        FileVO fileVO = new FileVO();
        fileVO.setFileId(1L);
        fileVO.setProjectId(1L);
        fileVO.setFilePath("/uploads/file.pdf");
        fileVO.setUploadedBy(100L);

        when(fileMapper.findById(1L, 1L)).thenReturn(fileVO);

        assertThrows(UnauthorizedException.class,
                () -> fileService.deleteFile(1L, 1L, 999L, "RESEARCHER"));
    }

    /** ADMIN은 타인 업로드 파일도 삭제 가능 — DB + 파일시스템 모두 삭제 호출 확인 */
    @Test
    void deleteFile_ADMIN_타인파일_성공() throws Exception {
        FileVO fileVO = new FileVO();
        fileVO.setFileId(1L);
        fileVO.setProjectId(1L);
        fileVO.setFilePath("/uploads/file.pdf");
        fileVO.setUploadedBy(100L);

        when(fileMapper.findById(1L, 1L)).thenReturn(fileVO);

        assertDoesNotThrow(() -> fileService.deleteFile(1L, 1L, 999L, "ADMIN"));

        verify(fileMapper, times(1)).delete(1L, 1L);
        verify(fileStorageStrategy, times(1)).delete("/uploads/file.pdf");
    }
}
